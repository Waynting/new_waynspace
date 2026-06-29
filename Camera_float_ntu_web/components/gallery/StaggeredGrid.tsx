"use client";

import { useEffect, useRef, useState } from "react";
import { PhotoWithExif } from "@/types";
import { PhotoCard } from "./PhotoCard";
import { ExhibitionViewer } from "./ExhibitionViewer";

interface StaggeredGridProps {
  photos: PhotoWithExif[];
  gap?: number;
}

export function StaggeredGrid({ photos, gap = 16 }: StaggeredGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(3);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      if (!width || width <= 0) return;

      let cols = 3;
      if (width < 640) cols = 1;
      else if (width < 1024) cols = 2;
      else if (width < 1536) cols = 3;
      else cols = 4;

      setColumnCount(Math.max(1, cols));
    };

    updateColumns();
    const timeoutId = setTimeout(updateColumns, 150);
    window.addEventListener("resize", updateColumns, { passive: true });
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateColumns);
    };
  }, []);

  // 错位网格：每列有不同的起始偏移
  const getStaggeredStyle = (index: number, columnIndex: number) => {
    const staggerAmount = 50; // 错位像素
    const columnOffset = columnIndex % 2 === 0 ? 0 : staggerAmount;
    return {
      marginTop: index === 0 ? `${columnOffset}px` : undefined,
    };
  };

  // 将照片分配到各列
  const columns: PhotoWithExif[][] = Array.from({ length: columnCount }, () => []);
  photos.forEach((photo, index) => {
    const columnIndex = index % columnCount;
    columns[columnIndex].push(photo);
  });

  return (
    <>
      <div
        ref={containerRef}
        className="w-full"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
          gap: `${gap}px`,
        }}
      >
        {columns.map((columnPhotos, columnIndex) => (
          <div key={columnIndex} className="flex flex-col" style={{ gap: `${gap}px` }}>
            {columnPhotos.map((photo, photoIndex) => (
              <div
                key={photo.key}
                style={getStaggeredStyle(photoIndex, columnIndex)}
              >
                <PhotoCard
                  photo={photo}
                  onClick={() => {
                    const globalIndex = photos.findIndex((p) => p.key === photo.key);
                    setViewerIndex(globalIndex);
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

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

