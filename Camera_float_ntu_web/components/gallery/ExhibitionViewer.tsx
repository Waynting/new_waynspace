"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhotoWithExif, ExifData } from "@/types";
import { getApiPath } from "@/lib/utils";

interface ExhibitionViewerProps {
  photos: PhotoWithExif[];
  initialIndex: number;
  onClose: () => void;
}

export function ExhibitionViewer({ photos, initialIndex, onClose }: ExhibitionViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [exifData, setExifData] = useState<ExifData | null>(photos[initialIndex]?.exif || null);
  const [isLoadingExif, setIsLoadingExif] = useState(false);

  const currentPhoto = photos[currentIndex];

  // 加载 EXIF 数据
  const loadExif = useCallback(async (photo: PhotoWithExif) => {
    if (photo.exif) {
      setExifData(photo.exif);
      return;
    }
    
    if (!photo.key) return;
    
    setIsLoadingExif(true);
    try {
      const response = await fetch(getApiPath(`/api/exif?key=${encodeURIComponent(photo.key)}`));
      if (response.ok) {
        const data = await response.json();
        if (data.exif) {
          setExifData(data.exif);
        }
      }
    } catch (error) {
      console.error("Error loading EXIF:", error);
    } finally {
      setIsLoadingExif(false);
    }
  }, []);

  // 当照片改变时加载 EXIF
  useEffect(() => {
    if (currentPhoto) {
      loadExif(currentPhoto);
    }
  }, [currentPhoto, loadExif]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, photos.length]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevious, handleNext, onClose]);

  // 防止背景滚动
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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

  if (!currentPhoto) return null;

  // 修复 URL 中的拼写错误（camara -> camera）
  const fixImageUrl = (url: string): string => {
    if (url.includes('camara-float-ntu.waynspace.com')) {
      return url.replace('camara-float-ntu.waynspace.com', 'camera-float-ntu.waynspace.com');
    }
    return url;
  };

  const imageUrl = fixImageUrl(currentPhoto.url);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* 关闭按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* 上一张按钮 */}
      {currentIndex > 0 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 z-10 text-white hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}

      {/* 下一张按钮 */}
      {currentIndex < photos.length - 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 z-10 text-white hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}

      {/* 照片容器 */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-4 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full max-w-7xl max-h-full flex flex-col items-center">
          {/* 照片 */}
          <div className="relative w-full max-h-[80vh] flex items-center justify-center mb-4">
            <div className="relative w-full max-h-[80vh] flex items-center justify-center">
              <img
                key={currentPhoto.key}
                src={imageUrl}
                alt={currentPhoto.name}
                className="max-w-full max-h-[80vh] object-contain transition-opacity duration-300"
              />
            </div>
          </div>

          {/* EXIF 信息 - 浅浅的显示 */}
          {exifData && (
            <div className="w-full max-w-4xl px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-white/70 text-xs sm:text-sm">
                {exifData.DateTimeOriginal && (
                  <div>
                    <div className="text-white/50 text-[10px] sm:text-xs mb-1">拍攝日期</div>
                    <div>{formatExifValue("DateTimeOriginal", exifData.DateTimeOriginal)}</div>
                  </div>
                )}
                {exifData.Make && exifData.Model && (
                  <div>
                    <div className="text-white/50 text-[10px] sm:text-xs mb-1">相機</div>
                    <div>{exifData.Make} {exifData.Model}</div>
                  </div>
                )}
                {exifData.ISO && (
                  <div>
                    <div className="text-white/50 text-[10px] sm:text-xs mb-1">ISO</div>
                    <div>{formatExifValue("ISO", exifData.ISO)}</div>
                  </div>
                )}
                {exifData.FNumber && (
                  <div>
                    <div className="text-white/50 text-[10px] sm:text-xs mb-1">光圈</div>
                    <div>{formatExifValue("FNumber", exifData.FNumber)}</div>
                  </div>
                )}
                {exifData.ExposureTime && (
                  <div>
                    <div className="text-white/50 text-[10px] sm:text-xs mb-1">快門</div>
                    <div>{formatExifValue("ExposureTime", exifData.ExposureTime)}</div>
                  </div>
                )}
                {exifData.FocalLength && (
                  <div>
                    <div className="text-white/50 text-[10px] sm:text-xs mb-1">焦距</div>
                    <div>{formatExifValue("FocalLength", exifData.FocalLength)}</div>
                  </div>
                )}
                {exifData.LensModel && (
                  <div>
                    <div className="text-white/50 text-[10px] sm:text-xs mb-1">鏡頭</div>
                    <div>{exifData.LensModel}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 照片计数 */}
          <div className="mt-3 text-white/50 text-xs sm:text-sm">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      </div>
    </div>
  );
}

