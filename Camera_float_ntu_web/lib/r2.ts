import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, DeleteObjectsCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;
const R2_ENDPOINT = process.env.R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
// R2 bucket 路径前缀（如果照片存储在 bucket 的子目录中，例如 "camera-float-ntu/"）
const R2_BUCKET_PREFIX = process.env.R2_BUCKET_PREFIX || "";

if (!R2_ACCOUNT_ID || !R2_BUCKET_NAME) {
  throw new Error("Missing required R2 environment variables: R2_ACCOUNT_ID, R2_BUCKET_NAME");
}

// Export bucket name for use in scripts
export { R2_BUCKET_NAME };

// R2 client is only needed if we have credentials (for listing files)
export let r2Client: S3Client | null = null;
if (R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
  r2Client = new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

export interface ListFoldersOptions {
  prefix?: string;
}

export async function listFolders(options: ListFoldersOptions = {}): Promise<string[]> {
  if (!r2Client) {
    throw new Error("R2 credentials are required to list folders");
  }

  // 组合 R2 bucket 前缀和用户提供的前缀
  const userPrefix = options.prefix || "";
  const prefix = R2_BUCKET_PREFIX ? `${R2_BUCKET_PREFIX}${userPrefix}` : userPrefix;
  
  console.log('📁 listFolders - R2_BUCKET_PREFIX:', R2_BUCKET_PREFIX, 'userPrefix:', userPrefix, 'final prefix:', prefix);
  
  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME,
    Prefix: prefix,
    Delimiter: "/",
  });

  try {
    const response = await r2Client.send(command);
    
    // 使用 Delimiter 时，Contents 只包含当前层级直接的文件（不在子文件夹中的）
    // 子文件夹会出现在 CommonPrefixes 中
    const directFilesCount = response.Contents?.length || 0;
    const subFoldersCount = response.CommonPrefixes?.length || 0;
    
    console.log("📁 R2 listFolders 响应:", {
      prefix: prefix || "(根目录)",
      CommonPrefixes: subFoldersCount,
      "子文件夹列表": response.CommonPrefixes?.map(p => p.Prefix) || [],
      Contents: directFilesCount,
      "当前层级直接文件": directFilesCount > 0 ? response.Contents?.map(c => c.Key) : "无（文件都在子文件夹中）",
    });
    
    const folders = (response.CommonPrefixes || [])
      .map((commonPrefix) => commonPrefix.Prefix)
      .filter((prefix): prefix is string => prefix !== undefined)
      .map((prefixPath) => {
        // Remove the base prefix (including R2_BUCKET_PREFIX) and get the folder name
        // 例如：如果 R2_BUCKET_PREFIX 是 "camera-float-ntu/"，prefix 是 "camera-float-ntu/Ver-1/"
        // prefixPath 是 "camera-float-ntu/Ver-1/Ver-1.1/"
        // 我们需要移除 "camera-float-ntu/Ver-1/" 得到 "Ver-1.1/"
        const basePrefix = prefix; // 使用完整的 prefix（包含 R2_BUCKET_PREFIX）
        const relativePath = basePrefix ? prefixPath.replace(basePrefix, "") : prefixPath;
        const parts = relativePath.split("/").filter(Boolean);
        return parts[0] || "";
      })
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
    
    console.log("✅ 提取的文件夹:", folders);
    return folders;
  } catch (error) {
    console.error("Error listing folders:", error);
    throw error;
  }
}

export interface ListPhotosOptions {
  folderName: string;
  prefix?: string;
}

export async function listPhotos(options: ListPhotosOptions): Promise<Array<{ key: string; name: string; size?: number; lastModified?: Date }>> {
  if (!r2Client) {
    throw new Error("R2 credentials are required to list photos");
  }

  // 直接使用文件夹名称作为前缀（确保以 / 结尾）
  const folderPrefix = options.folderName.endsWith('/') ? options.folderName : `${options.folderName}/`;
  // 组合 R2 bucket 前缀和文件夹前缀
  const fullPrefix = R2_BUCKET_PREFIX ? `${R2_BUCKET_PREFIX}${folderPrefix}` : folderPrefix;

  console.log('📁 列出照片 - folderName:', options.folderName, 'R2_BUCKET_PREFIX:', R2_BUCKET_PREFIX, 'fullPrefix:', fullPrefix);

  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME,
    Prefix: fullPrefix,
  });

  try {
    const response = await r2Client.send(command);
    console.log('📁 R2 响应 - 找到对象数量:', response.Contents?.length || 0);
    
    const photos = (response.Contents || [])
      .filter((object) => {
        const key = object.Key || "";
        const isImage = /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(key);
        if (!isImage) {
          console.log('⏭️ 跳过非图片文件:', key);
        }
        return isImage;
      })
      .map((object) => ({
        key: object.Key || "",
        name: (object.Key || "").split("/").pop() || "",
        size: object.Size,
        lastModified: object.LastModified,
      }));

    console.log('📸 找到照片数量:', photos.length);
    if (photos.length > 0) {
      console.log('📸 第一张照片:', photos[0]);
    }
    
    return photos;
  } catch (error) {
    console.error("❌ 列出照片时出错:", error);
    throw error;
  }
}

export async function getPhotoUrl(key: string, expiresIn: number = 3600): Promise<string> {
  // If public URL is configured, use it directly
  if (R2_PUBLIC_URL) {
    // 确保 key 没有前导斜杠，R2_PUBLIC_URL 也没有末尾斜杠
    // key 已经包含 R2_BUCKET_PREFIX（如果有的话），因为它是从 listPhotos 返回的完整 key
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
    const cleanPublicUrl = R2_PUBLIC_URL.endsWith('/') ? R2_PUBLIC_URL.slice(0, -1) : R2_PUBLIC_URL;

    const url = `${cleanPublicUrl}/${cleanKey}`;
    return url;
  }

  // Otherwise, use signed URL (requires credentials)
  if (!r2Client) {
    throw new Error("R2 credentials or R2_PUBLIC_URL is required to get photo URL");
  }

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  try {
    const url = await getSignedUrl(r2Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("Error getting photo URL:", error);
    throw error;
  }
}

export async function getPhotoObject(key: string) {
  if (!r2Client) {
    throw new Error("R2 credentials are required to get photo object");
  }

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  try {
    const response = await r2Client.send(command);
    return response;
  } catch (error) {
    console.error("Error getting photo object:", error);
    throw error;
  }
}

export interface PutPhotoOptions {
  key: string;
  body: Buffer;
  contentType?: string;
  metadata?: Record<string, string>;
}

export async function putPhotoObject(options: PutPhotoOptions): Promise<void> {
  if (!r2Client) {
    throw new Error("R2 credentials are required to put photo object");
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: options.key,
    Body: options.body,
    ContentType: options.contentType ?? "image/webp",
    ...(options.metadata ? { Metadata: options.metadata } : {}),
  });

  try {
    await r2Client.send(command);
  } catch (error) {
    console.error("Error putting photo object:", error);
    throw error;
  }
}

export interface DeleteFolderOptions {
  folderName: string;
  prefix?: string;
}

export async function deleteFolder(options: DeleteFolderOptions): Promise<number> {
  if (!r2Client) {
    throw new Error("R2 credentials are required to delete folder");
  }

  const basePrefix = options.prefix || "";
  const folderPrefix = basePrefix ? `${basePrefix}${options.folderName}/` : `${options.folderName}/`;
  // 组合 R2 bucket 前缀和文件夹前缀
  const fullPrefix = R2_BUCKET_PREFIX ? `${R2_BUCKET_PREFIX}${folderPrefix}` : folderPrefix;

  try {
    // First, list all objects in the folder
    const listCommand = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: fullPrefix,
    });

    let deletedCount = 0;
    let continuationToken: string | undefined;

    do {
      const listResponse = await r2Client.send(listCommand);
      const objects = listResponse.Contents || [];

      if (objects.length === 0) {
        break;
      }

      // Delete objects in batches (max 1000 per request)
      const deleteKeys = objects.map((obj) => ({ Key: obj.Key! }));
      
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: R2_BUCKET_NAME,
        Delete: {
          Objects: deleteKeys,
        },
      });

      const deleteResponse = await r2Client.send(deleteCommand);
      deletedCount += deleteResponse.Deleted?.length || 0;

      continuationToken = listResponse.NextContinuationToken;
      if (continuationToken) {
        listCommand.input.ContinuationToken = continuationToken;
      }
    } while (continuationToken);

    console.log(`Deleted ${deletedCount} objects from folder ${options.folderName}`);
    return deletedCount;
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw error;
  }
}

