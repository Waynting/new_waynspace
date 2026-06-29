import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { InfinitePhotoGrid } from "@/components/gallery/InfinitePhotoGrid";
import { PhotoWithExif } from "@/types";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listPhotos, getPhotoUrl, listFolders } from "@/lib/r2";
import { SubFolderList } from "@/components/gallery/SubFolderList";

interface FolderPageProps {
  params: Promise<{ folderName: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://camera-float-ntu-web.waynspace.com";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// 生成动态 metadata
export async function generateMetadata({
  params,
}: FolderPageProps): Promise<Metadata> {
  const { folderName } = await params;
  const fullFolderPath = Array.isArray(folderName) ? folderName.join("/") : folderName;
  const displayFolderName = Array.isArray(folderName) ? folderName[folderName.length - 1] : folderName;

  // 获取照片数量
  let photoCount = 0;
  try {
    const photos = await listPhotos({ folderName: fullFolderPath });
    photoCount = photos.length;
  } catch (error) {
    // 忽略错误
  }

  const title = `${displayFolderName} | 相機漂流計劃 台大Ver.`;
  const description = photoCount > 0 
    ? `${displayFolderName} - 共 ${photoCount} 張照片。相機漂流計劃 台大Ver. 的相簿，記錄校園生活的美好瞬間。`
    : `${displayFolderName} - 相機漂流計劃 台大Ver. 的相簿。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}${basePath}/folder/${fullFolderPath}`,
      siteName: "相機漂流計劃 台大Ver.",
      images: [
        {
          url: `${baseUrl}${basePath}/waynspace-logo.svg`,
          width: 1200,
          height: 630,
          alt: displayFolderName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}${basePath}/waynspace-logo.svg`],
    },
    alternates: {
      canonical: `${baseUrl}${basePath}/folder/${fullFolderPath}`,
    },
  };
}

async function getSubFolders(folderName: string): Promise<string[]> {
  try {
    // 确保 prefix 格式正确（以 / 结尾）
    const prefix = folderName.endsWith('/') ? folderName : `${folderName}/`;
    console.log("📁 getSubFolders - folderName:", folderName, "prefix:", prefix);
    const subFolders = await listFolders({ prefix });
    console.log("📁 getSubFolders - 找到子文件夹:", subFolders);
    return subFolders;
  } catch (error) {
    console.error("❌ getSubFolders - 错误:", error);
    return [];
  }
}

// 自然排序函数，支持数字格式（如 1.1, 1.2, 1.10, 1.11, 1.12）
function naturalSort(a: string, b: string): number {
  try {
    // 提取数字部分进行排序
    const extractNumbers = (str: string): number[] => {
      // 使用更精确的正则表达式匹配数字（包括小数）
      // 匹配模式：整数部分.小数部分，例如 "1.1" -> [1, 1], "1.10" -> [1, 10]
      const parts: number[] = [];
      const regex = /(\d+)(?:\.(\d+))?/g;
      let match;
      let iterations = 0;
      const maxIterations = 1000; // 防止无限循环
      
      while ((match = regex.exec(str)) !== null && iterations < maxIterations) {
        iterations++;
        // match[1] 是整数部分，match[2] 是小数部分（如果有）
        const intPart = parseInt(match[1], 10);
        if (!isNaN(intPart)) {
          parts.push(intPart);
        }
        if (match[2]) {
          const decPart = parseInt(match[2], 10);
          if (!isNaN(decPart)) {
            parts.push(decPart);
          }
        }
      }
      
      return parts;
    };

    const aNumbers = extractNumbers(a);
    const bNumbers = extractNumbers(b);
    
    // 如果都没有数字，使用字符串比较
    if (aNumbers.length === 0 && bNumbers.length === 0) {
      return a.localeCompare(b);
    }
    
    // 如果只有一个有数字，有数字的排在前面
    if (aNumbers.length === 0) return 1;
    if (bNumbers.length === 0) return -1;
    
    // 比较每个数字部分
    const minLength = Math.min(aNumbers.length, bNumbers.length);
    for (let i = 0; i < minLength; i++) {
      if (aNumbers[i] !== bNumbers[i]) {
        return aNumbers[i] - bNumbers[i];
      }
    }
    
    // 如果数字部分相同，比较长度（数字部分更多的排在后面）
    return aNumbers.length - bNumbers.length;
  } catch (error) {
    console.error('Error in naturalSort:', error);
    // 如果排序出错，回退到字符串比较
    return a.localeCompare(b);
  }
}

async function getPhotos(folderName: string, pageSize: number = 12) {
  try {
    console.log('📸 getPhotos - folderName:', folderName);
    const photos = await listPhotos({ folderName });
    console.log('📸 getPhotos - 找到照片数量:', photos.length);
    
    // Get first page for initial load (only generate URLs for what we need)
    const initialPhotosList = photos.slice(0, pageSize);
    console.log('📸 getPhotos - 初始加载照片数量:', initialPhotosList.length);
    
    // Generate URLs only for initial photos (parallel)
    const photosWithUrls = await Promise.all(
      initialPhotosList.map(async (photo) => {
        const url = await getPhotoUrl(photo.key);
        return {
          ...photo,
          url,
        };
      })
    );

    console.log('📸 getPhotos - 生成 URL 完成，返回照片数量:', photosWithUrls.length);
    return {
      photos: photosWithUrls,
      total: photos.length,
    };
  } catch (error) {
    console.error("❌ getPhotos - 错误:", error);
    return null;
  }
}

export default async function FolderPage({ params, searchParams }: FolderPageProps) {
  const { folderName } = await params;

  // Join folderName array to create the full path
  const fullFolderPath = Array.isArray(folderName) ? folderName.join("/") : folderName;
  const displayFolderName = Array.isArray(folderName) ? folderName[folderName.length - 1] : folderName;

  console.log("Folder page - fullFolderPath:", fullFolderPath);
  console.log("Folder page - displayFolderName:", displayFolderName);

  // First, check if there are subfolders
  const subFolders = await getSubFolders(fullFolderPath);
  console.log("Folder page - subFolders:", subFolders);

  // 如果是 Ver-1 本身（没有子路径），只显示子文件夹列表，不获取照片
  const isVer1Root = fullFolderPath === "Ver-1";
  
  // Get photos data (only if not Ver-1 root or if it's a subfolder)
  let data = null;
  if (!isVer1Root) {
    data = await getPhotos(fullFolderPath);
    // 如果是子文件夹但没有照片，仍然显示页面（可能只是空文件夹）
    if (!data) {
      // 检查是否是 Ver-1 的子文件夹
      if (fullFolderPath.startsWith("Ver-1/")) {
        // 允许显示空文件夹页面
        data = { photos: [], total: 0 };
      } else {
        notFound();
      }
    }
  }

  const { photos, total } = data || { photos: [], total: 0 };

  // 获取上一个和下一个相簿
  let prevFolder: string | null = null;
  let nextFolder: string | null = null;
  let prevFolderPath: string | null = null;
  let nextFolderPath: string | null = null;
  
  if (!isVer1Root) {
    // 获取父文件夹路径
    const pathParts = fullFolderPath.split("/");
    const parentFolder = pathParts.slice(0, -1).join("/");
    const currentFolderName = pathParts[pathParts.length - 1];
    
    // 获取父文件夹下的所有子文件夹
    try {
      const siblingFolders = await getSubFolders(parentFolder || "");
      if (siblingFolders.length > 0) {
        // 对子文件夹进行排序
        const sortedSiblings = [...siblingFolders].sort(naturalSort);
        
        // 找到当前相簿在排序列表中的位置
        const currentIndex = sortedSiblings.findIndex(folder => folder === currentFolderName);
        
        if (currentIndex !== -1) {
          // 如果有上一个相簿
          if (currentIndex > 0) {
            prevFolder = sortedSiblings[currentIndex - 1];
            prevFolderPath = parentFolder ? `${parentFolder}/${prevFolder}` : prevFolder;
          }
          // 如果有下一个相簿
          if (currentIndex < sortedSiblings.length - 1) {
            nextFolder = sortedSiblings[currentIndex + 1];
            nextFolderPath = parentFolder ? `${parentFolder}/${nextFolder}` : nextFolder;
          }
        }
      }
    } catch (error) {
      console.error("❌ 获取相邻相簿时出错:", error);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      {/* Show subfolder dialog if there are subfolders */}
      {subFolders.length > 0 && (
        <SubFolderList parentFolder={fullFolderPath} subFolders={subFolders} />
      )}

      <div className="space-y-2 sm:space-y-0">
        {/* 相簿名称和切换按钮 - 使用 grid 3 列布局，同一水平高度 */}
        <div className="grid grid-cols-3 items-center gap-4 min-h-[3rem]">
          {/* 左切换按钮 - 第1列 */}
          <div className="flex justify-start">
            {prevFolderPath ? (
              <Link href={`/folder/${prevFolderPath}`}>
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <div className="w-10" />
            )}
          </div>
          
          {/* 相簿名称 - 第2列，居中 */}
          <div className="flex justify-center min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold break-words text-center">{displayFolderName}</h1>
          </div>
          
          {/* 右切换按钮 - 第3列 */}
          <div className="flex justify-end">
            {nextFolderPath ? (
              <Link href={`/folder/${nextFolderPath}`}>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <div className="w-10" />
            )}
          </div>
        </div>
        
        {/* 描述文字 - 单独一行 */}
        <p className="text-sm sm:text-base text-muted-foreground text-center sm:text-left">
          {subFolders.length > 0 
            ? `此資料夾包含 ${subFolders.length} 個子資料夾，請從上方彈出視窗選擇`
            : `共 ${total} 張照片`
          }
        </p>
      </div>

      {/* Show photos if available, even if there are subfolders */}
      {!isVer1Root && total > 0 ? (
        <InfinitePhotoGrid
          folderName={fullFolderPath}
          initialPhotos={photos as PhotoWithExif[]}
          totalPhotos={total}
        />
      ) : !isVer1Root && subFolders.length > 0 ? (
        <div className="text-center py-8 sm:py-12 text-muted-foreground text-sm sm:text-base">
          此資料夾沒有照片，請從上方彈出視窗選擇子資料夾以瀏覽照片
        </div>
      ) : !isVer1Root ? (
        <div className="text-center py-8 sm:py-12 text-muted-foreground text-sm sm:text-base">
          此資料夾目前沒有照片
        </div>
      ) : null}
    </div>
  );
}

