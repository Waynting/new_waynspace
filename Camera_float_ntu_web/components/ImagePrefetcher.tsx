"use client";

import { useEffect, useRef } from "react";
import { getApiPath } from "@/lib/utils";

interface PhotoData {
  key: string;
  name: string;
  url: string;
}

interface FolderPhotosResponse {
  photos: PhotoData[];
  pagination: {
    total: number;
  };
}

// 预加载配置
const PREFETCH_CONFIG = {
  // 每个文件夹预加载的图片数量
  photosPerFolder: 6,
  // 预加载延迟（毫秒），避免影响首页渲染
  delay: 1000,
  // 图片加载间隔（毫秒），避免同时请求太多
  interval: 100,
};

/**
 * 图片预加载组件
 * 在首页加载完成后，背景预加载各文件夹的前几张图片
 */
export function ImagePrefetcher() {
  const prefetchedRef = useRef(false);

  useEffect(() => {
    // 防止重复预加载
    if (prefetchedRef.current) return;
    prefetchedRef.current = true;

    const prefetchImages = async () => {
      try {
        // 1. 获取 manifest index（直接从 public 读取，不经过 API）
        const indexResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/photos-manifest/index.json`
        );

        if (!indexResponse.ok) {
          console.log("[Prefetcher] 无法获取 manifest index");
          return;
        }

        const indexData = await indexResponse.json();
        const folders = Object.keys(indexData.folders || {});

        if (folders.length === 0) {
          console.log("[Prefetcher] 没有文件夹需要预加载");
          return;
        }

        console.log(`[Prefetcher] 开始预加载 ${folders.length} 个文件夹的图片...`);

        // 2. 延迟开始预加载，确保首页已渲染完成
        await new Promise((resolve) => setTimeout(resolve, PREFETCH_CONFIG.delay));

        // 3. 依次预加载每个文件夹的图片
        for (const folder of folders) {
          try {
            // 获取文件夹的图片列表（只取前几张）
            const photosResponse = await fetch(
              getApiPath(`/api/photos?folder=${encodeURIComponent(folder)}&page=1&pageSize=${PREFETCH_CONFIG.photosPerFolder}`)
            );

            if (!photosResponse.ok) continue;

            const photosData: FolderPhotosResponse = await photosResponse.json();
            const photos = photosData.photos || [];

            // 预加载图片
            for (const photo of photos) {
              prefetchImage(photo.url);
              // 间隔加载，避免并发过高
              await new Promise((resolve) =>
                setTimeout(resolve, PREFETCH_CONFIG.interval)
              );
            }

            console.log(`[Prefetcher] 已预加载 ${folder}: ${photos.length} 张图片`);
          } catch (error) {
            console.warn(`[Prefetcher] 预加载 ${folder} 失败:`, error);
          }
        }

        console.log("[Prefetcher] 预加载完成");
      } catch (error) {
        console.warn("[Prefetcher] 预加载失败:", error);
      }
    };

    // 使用 requestIdleCallback 在浏览器空闲时执行（如果支持）
    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(prefetchImages);
      } else {
        // 降级方案：使用 setTimeout
        setTimeout(prefetchImages, PREFETCH_CONFIG.delay);
      }
    }
  }, []);

  // 不渲染任何内容
  return null;
}

/**
 * 预加载单张图片
 * 使用 link rel="prefetch" 或 Image 对象
 */
function prefetchImage(url: string) {
  // 方法1：使用 link prefetch（浏览器会智能处理优先级）
  if (typeof document !== "undefined") {
    // 检查是否已经预加载过
    const existing = document.querySelector(`link[href="${url}"]`);
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "image";
    link.href = url;
    document.head.appendChild(link);
  }
}
