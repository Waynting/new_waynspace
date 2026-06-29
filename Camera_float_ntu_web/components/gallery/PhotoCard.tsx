"use client";

import { useState, useRef } from "react";
import { Lightbox } from "@/components/ui/lightbox";
import { PhotoWithExif, ExifData } from "@/types";
import { getApiPath } from "@/lib/utils";

interface PhotoCardProps {
  photo: PhotoWithExif;
  onExifLoad?: (photo: PhotoWithExif) => void;
  onImageLoad?: () => void;
  priority?: boolean;
  onClick?: () => void;
}

export function PhotoCard({ photo, onExifLoad, onImageLoad, priority = false, onClick }: PhotoCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [exifData, setExifData] = useState<ExifData | null>(photo.exif || null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);

  // 检查是否是签名 URL（包含查询参数）
  const isSignedUrl = photo.url.includes("?");

  const imageUrl = photo.url;

  const loadExif = async () => {
    if (exifData || !photo.key) return;
    
    try {
      // 使用默认缓存策略，依赖服务器端的 Cache-Control 头
      const response = await fetch(getApiPath(`/api/exif?key=${encodeURIComponent(photo.key)}`));
      if (response.ok) {
        const data = await response.json();
        if (data.exif) {
          setExifData(data.exif);
          if (onExifLoad) {
            onExifLoad({ ...photo, exif: data.exif });
          }
        }
      }
    } catch (error) {
      console.error("Error loading EXIF:", error);
    }
  };

  const handleClick = () => {
    // 如果提供了 onClick 回调（展览厅模式），使用它
    if (onClick) {
      onClick();
      return;
    }
    // 否则使用原来的 Dialog 模式
    setIsOpen(true);
    loadExif();
  };

  const formatExifValue = (key: string, value: any): string => {
    if (value === undefined || value === null) return "-";
    
    switch (key) {
      case "FNumber":
        return `f/${value}`;
      case "ExposureTime":
        if (value < 1) {
          return `1/${Math.round(1 / value)}s`;
        }
        return `${value}s`;
      case "FocalLength":
        return `${value}mm`;
      case "ISO":
        return `ISO ${value}`;
      case "DateTimeOriginal":
        try {
          if (value instanceof Date) {
            return value.toLocaleString("zh-TW");
          }
          if (typeof value === "string") {
            return new Date(value).toLocaleString("zh-TW");
          }
          return String(value);
        } catch {
          return String(value);
        }
      default:
        return String(value);
    }
  };

  return (
    <>
      <div
        className="group relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity duration-300"
        onClick={handleClick}
        data-photo-key={photo.key}
        style={aspectRatio ? { aspectRatio: `${aspectRatio}` } : { minHeight: '240px' }}
      >
        {isLoading && (
          <div className="absolute inset-0 w-full h-full bg-muted" />
        )}
        {!imageError ? (
          <img
            ref={imageRef}
            src={imageUrl}
            alt={photo.name}
            className="w-full h-full object-cover"
            loading={priority ? "eager" : "lazy"}
            onLoad={(e) => {
              setIsLoading(false);
              setImageError(false);
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight) {
                const ratio = img.naturalWidth / img.naturalHeight;
                setAspectRatio(ratio);
              }
              if (onImageLoad) {
                onImageLoad();
              }
            }}
            onError={(e) => {
              setIsLoading(false);
              if (retryCount === 0) {
                console.warn('Image load error:', {
                  url: imageUrl,
                  key: photo.key,
                  originalUrl: photo.url,
                });
              }

              if (retryCount < 2) {
                setRetryCount(prev => prev + 1);
                setTimeout(() => {
                  if (imageRef.current && !imageError) {
                    const img = imageRef.current;
                    img.src = '';
                    img.src = imageUrl;
                  }
                }, 1000 * (retryCount + 1));
              } else {
                setImageError(true);
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center p-4 text-muted-foreground text-sm">
              <p>無法載入圖片</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImageError(false);
                  setRetryCount(0);
                  if (imageRef.current) {
                    const img = imageRef.current;
                    img.src = '';
                    img.src = imageUrl;
                  }
                }}
                className="mt-2 underline"
              >
                重試
              </button>
            </div>
          </div>
        )}
      </div>

      <Lightbox
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        imageUrl={imageUrl}
        imageName={photo.name}
        exifData={exifData}
      />
    </>
  );
}

