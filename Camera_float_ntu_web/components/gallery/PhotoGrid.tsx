"use client";

import { PhotoWithExif } from "@/types";
import { PhotoCard } from "./PhotoCard";

interface PhotoGridProps {
  photos: PhotoWithExif[];
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  // 前 8 张图片设置优先级，加快首屏加载
  const priorityCount = 8;

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-2">
      {photos.map((photo, index) => (
        <div
          key={photo.key}
          className="break-inside-avoid mb-2"
        >
          <PhotoCard
            photo={photo}
            priority={index < priorityCount}
          />
        </div>
      ))}
    </div>
  );
}

