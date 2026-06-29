"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { PhotoWithExif } from "@/types";
import { PhotoCard } from "./PhotoCard";
import { ExhibitionViewer } from "./ExhibitionViewer";

interface MasonryGridProps {
  photos: PhotoWithExif[];
  gap?: number;
}

export function MasonryGrid({ photos, gap = 8 }: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(4);
  const photoHeightsRef = useRef<Map<string, number>>(new Map());
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [photoColumns, setPhotoColumns] = useState<Map<string, number>>(new Map());

  // 根据容器宽度动态调整列数
  useEffect(() => {
    const updateColumns = () => {
      try {
        if (!containerRef.current) return;

        const width = containerRef.current.offsetWidth;
        if (!width || width <= 0) return;

        let cols = 4;
        
        // 移动端：1-2 列
        if (width < 640) cols = 1;
        else if (width < 1024) cols = 2;
        // 平板：3 列
        else if (width < 1280) cols = 3;
        // 电脑版：根据宽度增加列数，填满画面
        else if (width < 1536) cols = 4;  // 小屏幕电脑
        else if (width < 1920) cols = 5;  // 标准电脑
        else if (width < 2560) cols = 6;  // 大屏幕
        else cols = 7;  // 超大屏幕

        // 确保列数至少为 1
        const validCols = Math.max(1, Math.floor(cols));
        setColumnCount(validCols);
        // 重置照片列分配
        setPhotoColumns(new Map());
        photoHeightsRef.current.clear();
      } catch (error) {
        console.error('Error updating columns:', error);
      }
    };

    // 使用防抖优化 resize 事件
    let timeoutId: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateColumns, 150);
    };

    updateColumns();
    
    // 使用 passive 选项优化移动端性能
    const resizeOptions = { passive: true };
    window.addEventListener("resize", debouncedUpdate, resizeOptions);
    
    // 监听方向变化（移动端）
    window.addEventListener("orientationchange", updateColumns, resizeOptions);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", debouncedUpdate);
      window.removeEventListener("orientationchange", updateColumns);
    };
  }, []);

  // 初始分配：按顺序平均分配到各列（从上到下）
  useEffect(() => {
    if (!photos || photos.length === 0) return;
    
    // 确保 columnCount 是有效值
    const validColumnCount = Math.max(1, Math.floor(columnCount) || 1);
    
    const initialColumns = new Map<string, number>();
    photos.forEach((photo, index) => {
      if (!photo || !photo.key) return;
      // 按顺序平均分配到各列，实现从上到下的平均分布
      initialColumns.set(photo.key, index % validColumnCount);
    });
    
    setPhotoColumns(initialColumns);
  }, [photos, columnCount]);

  // 当照片加载完成时，记录高度（不重新分配，保持初始分配）
  const handleImageLoad = useCallback((photoKey: string, height: number) => {
    photoHeightsRef.current.set(photoKey, height);
  }, []);

  // 按列组织照片
  const photosByColumn = useMemo(() => {
    // 确保 columnCount 是有效值
    const validColumnCount = Math.max(1, Math.floor(columnCount) || 1);
    const columns: PhotoWithExif[][] = Array.from({ length: validColumnCount }, () => []);
    
    if (!photos || photos.length === 0) {
      return columns;
    }
    
    photos.forEach((photo, index) => {
      if (!photo || !photo.key) return;
      
      const col = photoColumns.get(photo.key) ?? (index % validColumnCount);
      // 确保 col 在有效范围内
      const safeCol = Math.max(0, Math.min(col, validColumnCount - 1));
      
      if (columns[safeCol]) {
        columns[safeCol].push(photo);
      }
    });
    
    return columns;
  }, [photos, photoColumns, columnCount]);

  const handlePhotoClick = useCallback((index: number) => {
    setViewerIndex(index);
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="w-full"
        style={{
          display: 'flex',
          gap: `${gap}px`,
        }}
      >
        {photosByColumn.map((columnPhotos, colIndex) => (
          <div
            key={colIndex}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: `${gap}px`,
            }}
          >
            {columnPhotos.map((photo, photoIndex) => {
              const globalIndex = photos.findIndex(p => p.key === photo.key);
              return (
                <div
                  key={`${colIndex}-${photoIndex}-${photo.key}`}
                  style={{
                    width: '100%',
                  }}
                >
                  <PhotoCard
                    photo={photo}
                    priority={globalIndex < 6}
                    onImageLoad={() => {
                      // 使用 requestAnimationFrame 优化性能，添加错误处理
                      try {
                        requestAnimationFrame(() => {
                          try {
                            const photoElement = document.querySelector(`[data-photo-key="${photo.key}"]`);
                            if (photoElement) {
                              const rect = photoElement.getBoundingClientRect();
                              if (rect && rect.height > 0) {
                                handleImageLoad(photo.key, rect.height);
                              }
                            }
                          } catch (error) {
                            console.error('Error in onImageLoad callback:', error);
                          }
                        });
                      } catch (error) {
                        console.error('Error scheduling image load:', error);
                      }
                    }}
                    onClick={() => handlePhotoClick(globalIndex)}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 展览厅查看器 */}
      {viewerIndex !== null && (
        <ExhibitionViewer
          photos={photos}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  );
}

