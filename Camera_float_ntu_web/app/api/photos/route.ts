import { NextRequest, NextResponse } from "next/server";
import { listPhotos, getPhotoUrl } from "@/lib/r2";
import { FolderManifest } from "@/types/photos-manifest";
import * as fs from "fs";
import * as path from "path";

// 强制动态渲染，因为使用了 searchParams
export const dynamic = 'force-dynamic';

// 内存缓存：存储已读取的文件夹数据
const folderCache = new Map<string, { data: FolderManifest; loadedAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟缓存

// 索引缓存
let indexCache: { folders: Record<string, { total: number; file: string }>; loadedAt: number } | null = null;

// 读取索引文件
function readManifestIndex(): Record<string, { total: number; file: string }> | null {
  // 检查缓存
  if (indexCache && Date.now() - indexCache.loadedAt < CACHE_TTL) {
    return indexCache.folders;
  }

  try {
    const indexPath = path.join(process.cwd(), "public", "photos-manifest", "index.json");
    if (fs.existsSync(indexPath)) {
      const indexData = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
      indexCache = { folders: indexData.folders, loadedAt: Date.now() };
      return indexData.folders;
    }
  } catch (error) {
    console.warn("⚠️ 无法读取索引文件:", error);
  }
  return null;
}

// 读取单个文件夹的 JSON 文件（带缓存）
function readFolderManifest(folderName: string): FolderManifest | null {
  // 检查内存缓存
  const cached = folderCache.get(folderName);
  if (cached && Date.now() - cached.loadedAt < CACHE_TTL) {
    return cached.data;
  }

  // 先检查索引
  const index = readManifestIndex();
  if (!index || !index[folderName]) {
    return null;
  }

  try {
    const fileName = index[folderName].file;
    const filePath = path.join(process.cwd(), "public", "photos-manifest", fileName);
    if (fs.existsSync(filePath)) {
      const folderData = JSON.parse(fs.readFileSync(filePath, "utf-8")) as FolderManifest;
      // 存入缓存
      folderCache.set(folderName, { data: folderData, loadedAt: Date.now() });
      return folderData;
    }
  } catch (error) {
    console.warn(`⚠️ 无法读取文件夹 ${folderName} 的清单:`, error);
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const folderName = searchParams.get("folder");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSizeParam = searchParams.get("pageSize");
    // 如果没有指定 pageSize 或设置为 0，返回所有照片
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 0;

    console.log('📡 API /api/photos - folderName:', folderName, 'page:', page, 'pageSize:', pageSize);

    if (!folderName) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    // 优先尝试从分离的 JSON 文件读取（带缓存）
    const folderData = readFolderManifest(folderName);
    if (folderData) {
      console.log('✅ 从 JSON 清单读取照片数据 (缓存)');
      let photos = folderData.photos.map(photo => ({
        key: photo.key,
        name: photo.name,
        url: photo.url,
        size: photo.size,
        lastModified: photo.lastModified ? new Date(photo.lastModified) : undefined,
      }));

      // Pagination
      let paginatedPhotosList = photos;
      let totalPages = 1;
      
      if (pageSize > 0) {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        paginatedPhotosList = photos.slice(startIndex, endIndex);
        totalPages = Math.ceil(photos.length / pageSize);
      }

      return NextResponse.json(
        {
          photos: paginatedPhotosList,
          pagination: {
            page,
            pageSize,
            total: photos.length,
            totalPages,
          },
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          },
        }
      );
    }

    // 回退到 R2 API（如果 JSON 不存在或文件夹不在清单中）
    console.log('⚠️ JSON 清单不存在或文件夹不在清单中，使用 R2 API');
    const photos = await listPhotos({ folderName });
    console.log('📡 API /api/photos - 找到照片数量:', photos.length);
    
    // Pagination - if pageSize is 0 or not specified, return all photos
    let paginatedPhotosList = photos;
    let totalPages = 1;
    
    if (pageSize > 0) {
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      paginatedPhotosList = photos.slice(startIndex, endIndex);
      totalPages = Math.ceil(photos.length / pageSize);
    }
    
    // Generate URLs for photos (parallel)
    const paginatedPhotos = await Promise.all(
      paginatedPhotosList.map(async (photo) => {
        const url = await getPhotoUrl(photo.key);
        return {
          ...photo,
          url,
        };
      })
    );

    return NextResponse.json(
      {
        photos: paginatedPhotos,
        pagination: {
          page,
          pageSize,
          total: photos.length,
          totalPages,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

