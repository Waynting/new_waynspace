// 必须在导入其他模块之前加载环境变量
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// 尝试加载多个可能的环境变量文件
const envFiles = [".env.local", ".env"];
for (const envFile of envFiles) {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`✅ 已加载环境变量文件: ${envFile}`);
    break;
  }
}

// 使用动态导入，确保环境变量加载后再导入 R2 模块
import type { PhotosManifest, FolderManifest } from "../types/photos-manifest";

// 索引文件类型：记录所有文件夹及其元数据
interface ManifestIndex {
  generatedAt: string;
  folders: Record<string, { total: number; file: string }>;
}

async function generatePhotosManifest() {
  console.log("🚀 开始生成照片清单...");

  // 动态导入 R2 模块（环境变量已加载）
  const { listFolders, listPhotos, getPhotoUrl } = await import("../lib/r2");

  const generatedAt = new Date().toISOString();
  const manifestIndex: ManifestIndex = {
    generatedAt,
    folders: {},
  };

  // 确保目录存在
  const publicDir = path.join(process.cwd(), "public");
  const manifestDir = path.join(publicDir, "photos-manifest");

  // 清理旧的 manifest 目录
  if (fs.existsSync(manifestDir)) {
    fs.rmSync(manifestDir, { recursive: true });
  }
  fs.mkdirSync(manifestDir, { recursive: true });

  let totalPhotos = 0;

  // 递归处理文件夹的函数
  async function processFolder(folderPath: string, depth: number = 0) {
    const indent = "  ".repeat(depth);
    console.log(`${indent}📁 处理文件夹: ${folderPath || "(根目录)"}`);

    // 获取当前文件夹的子文件夹
    const subFolders = await listFolders({ prefix: folderPath ? `${folderPath}/` : "" });
    console.log(`${indent}   找到 ${subFolders.length} 个子文件夹:`, subFolders);

    // 如果有子文件夹，递归处理每个子文件夹
    if (subFolders.length > 0) {
      for (const subFolder of subFolders) {
        const fullPath = folderPath ? `${folderPath}/${subFolder}` : subFolder;
        await processFolder(fullPath, depth + 1);
      }
    } else if (folderPath) {
      // 没有子文件夹，这是一个叶子文件夹，获取照片
      console.log(`${indent}📸 获取照片: ${folderPath}`);
      try {
        const photos = await listPhotos({ folderName: folderPath });
        console.log(`${indent}   找到 ${photos.length} 张照片`);

        if (photos.length > 0) {
          // 为每张照片生成 URL
          const photosWithUrls = await Promise.all(
            photos.map(async (photo) => {
              const url = await getPhotoUrl(photo.key);
              return {
                key: photo.key,
                name: photo.name,
                url,
                size: photo.size,
                lastModified: photo.lastModified?.toISOString(),
              };
            })
          );

          // 创建单个文件夹的 manifest
          const folderManifest: FolderManifest = {
            photos: photosWithUrls,
            total: photosWithUrls.length,
          };

          // 生成安全的文件名（将 / 替换为 --）
          const safeFileName = folderPath.replace(/\//g, "--") + ".json";
          const folderManifestPath = path.join(manifestDir, safeFileName);

          // 写入单个文件夹的 JSON（不缩进，减少体积）
          fs.writeFileSync(folderManifestPath, JSON.stringify(folderManifest), "utf-8");

          // 更新索引
          manifestIndex.folders[folderPath] = {
            total: photosWithUrls.length,
            file: safeFileName,
          };

          totalPhotos += photosWithUrls.length;
          console.log(`${indent}   ✅ 完成文件夹 ${folderPath} -> ${safeFileName}`);
        }
      } catch (error) {
        console.error(`${indent}   ❌ 处理文件夹 ${folderPath} 时出错:`, error);
      }
    }
  }

  try {
    // 从根目录开始递归处理
    await processFolder("");

    // 写入索引文件
    const indexPath = path.join(manifestDir, "index.json");
    fs.writeFileSync(indexPath, JSON.stringify(manifestIndex, null, 2), "utf-8");

    // 同时保留旧的单文件格式（向后兼容）
    const legacyManifest: PhotosManifest = {
      generatedAt,
      folders: {},
    };
    for (const [folderPath, meta] of Object.entries(manifestIndex.folders)) {
      const folderData = JSON.parse(
        fs.readFileSync(path.join(manifestDir, meta.file), "utf-8")
      ) as FolderManifest;
      legacyManifest.folders[folderPath] = folderData;
    }
    fs.writeFileSync(
      path.join(publicDir, "photos-manifest.json"),
      JSON.stringify(legacyManifest),
      "utf-8"
    );

    console.log(`\n✅ 照片清单已生成!`);
    console.log(`📊 统计:`);
    console.log(`   - 文件夹数量: ${Object.keys(manifestIndex.folders).length}`);
    console.log(`   - 总照片数: ${totalPhotos}`);
    console.log(`   - 生成时间: ${generatedAt}`);
    console.log(`📁 文件:`);
    console.log(`   - 索引文件: ${indexPath}`);
    console.log(`   - 分离文件目录: ${manifestDir}/`);
    console.log(`   - 兼容文件: ${path.join(publicDir, "photos-manifest.json")}`);
  } catch (error) {
    console.error("❌ 生成照片清单时出错:", error);
    process.exit(1);
  }
}

// 运行脚本
generatePhotosManifest();

