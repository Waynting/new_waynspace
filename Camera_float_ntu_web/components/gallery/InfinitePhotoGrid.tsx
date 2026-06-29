"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PhotoWithExif } from "@/types";
import { MasonryGrid } from "./MasonryGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiPath } from "@/lib/utils";

interface InfinitePhotoGridProps {
  folderName: string;
  initialPhotos: PhotoWithExif[];
  totalPhotos: number;
  pageSize?: number;
}

export function InfinitePhotoGrid({
  folderName,
  initialPhotos,
  totalPhotos,
  pageSize = 12,
}: InfinitePhotoGridProps) {
  const [photos, setPhotos] = useState<PhotoWithExif[]>(initialPhotos);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPhotos.length < totalPhotos);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMorePhotos = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const apiUrl = getApiPath(`/api/photos?folder=${encodeURIComponent(folderName)}&page=${nextPage}&pageSize=${pageSize}`);
      console.log('🔄 InfinitePhotoGrid - 加载更多照片:', { folderName, page: nextPage, apiUrl });
      
      // 添加超时控制和错误处理
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
      
      try {
        // 使用默认缓存策略，依赖服务器端的 Cache-Control 头
        const response = await fetch(apiUrl, {
          signal: controller.signal,
          // 添加移动端优化选项
          cache: 'default',
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ InfinitePhotoGrid - API 错误:', response.status, errorText);
          throw new Error(`Failed to fetch photos: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ InfinitePhotoGrid - 收到照片数据:', { photoCount: data.photos?.length || 0, total: data.pagination?.total || 0 });
        const newPhotos = data.photos as PhotoWithExif[];

        if (newPhotos && Array.isArray(newPhotos) && newPhotos.length > 0) {
          setPhotos((prev) => {
            // 确保 prev 是数组
            const prevPhotos = Array.isArray(prev) ? prev : [];
            const updatedPhotos = [...prevPhotos, ...newPhotos];
            setHasMore(updatedPhotos.length < totalPhotos);
            return updatedPhotos;
          });
          setPage(nextPage);
        } else {
          setHasMore(false);
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.error('Request timeout');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error("Error loading more photos:", error);
      // 不要立即禁用 hasMore，允许重试
      // setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [folderName, page, pageSize, isLoading, hasMore, totalPhotos]);

  useEffect(() => {
    // 检查 IntersectionObserver 是否可用
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver is not supported');
      return;
    }

    let observer: IntersectionObserver | null = null;
    
    try {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && hasMore && !isLoading) {
            loadMorePhotos();
          }
        },
        { 
          threshold: 0.1,
          rootMargin: '200px' // 提前200px开始加载
        }
      );

      const currentTarget = observerTarget.current;
      if (currentTarget && observer) {
        observer.observe(currentTarget);
      }
    } catch (error) {
      console.error('Error creating IntersectionObserver:', error);
    }

    return () => {
      if (observer && observerTarget.current) {
        try {
          observer.unobserve(observerTarget.current);
        } catch (error) {
          console.error('Error unobserve:', error);
        }
      }
    };
  }, [hasMore, isLoading, loadMorePhotos]);

  return (
    <>
      <MasonryGrid photos={photos} gap={16} />

      {/* 加载更多触发器和加载状态 */}
      {hasMore && (
        <div ref={observerTarget} className="mt-8">
          {isLoading && (
            <div 
              className="w-full max-w-7xl mx-auto"
              style={{
                columnCount: 4,
                columnGap: "16px",
              }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="break-inside-avoid mb-4">
                  <Skeleton className="w-full" style={{ height: "200px" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 已加载所有照片的提示 */}
      {!hasMore && photos.length > 0 && (
        <div className="text-center text-muted-foreground py-8">
          已顯示所有 {totalPhotos} 張照片
        </div>
      )}
    </>
  );
}

