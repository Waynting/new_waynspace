"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Download, Info } from "lucide-react";
import { ExifData } from "@/types";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
  exifData?: ExifData | null;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export function Lightbox({
  isOpen,
  onClose,
  imageUrl,
  imageName,
  exifData,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: LightboxProps) {
  const [showInfo, setShowInfo] = React.useState(false);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (onPrev && hasPrev) onPrev();
          break;
        case "ArrowRight":
          if (onNext && hasNext) onNext();
          break;
        case "i":
        case "I":
          setShowInfo((prev: boolean) => !prev);
          break;
      }
    },
    [isOpen, onClose, onNext, onPrev, hasNext, hasPrev]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 bg-black/95 animate-fade-in">
      {/* Header controls */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
        <h3 className="text-white text-sm sm:text-base font-medium truncate max-w-md">
          {imageName}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Toggle info"
          >
            <Info className="w-5 h-5" />
          </button>
          <a
            href={imageUrl}
            download={imageName}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Download"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main image area */}
      <div
        className="absolute inset-0 flex items-center justify-center p-4 sm:p-8"
        onClick={onClose}
      >
        <img
          src={imageUrl}
          alt={imageName}
          className="max-w-full max-h-full object-contain animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Navigation arrows */}
      {onPrev && hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {onNext && hasNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* EXIF Info Panel */}
      {showInfo && exifData && (
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-80 md:w-96 bg-black/90 backdrop-blur-lg p-6 overflow-y-auto animate-fade-in">
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
              拍攝資訊
            </h4>

            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-white/60 mb-2">相機設定</h5>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-white/60">拍攝日期</dt>
                    <dd className="text-white font-medium">
                      {formatExifValue("DateTimeOriginal", exifData.DateTimeOriginal)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">相機型號</dt>
                    <dd className="text-white font-medium text-right">
                      {exifData.Make && exifData.Model
                        ? `${exifData.Make} ${exifData.Model}`
                        : "-"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">鏡頭</dt>
                    <dd className="text-white font-medium text-right">
                      {exifData.LensModel || "-"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h5 className="text-sm font-medium text-white/60 mb-2">曝光參數</h5>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-white/60">ISO</dt>
                    <dd className="text-white font-medium">
                      {formatExifValue("ISO", exifData.ISO)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">光圈</dt>
                    <dd className="text-white font-medium">
                      {formatExifValue("FNumber", exifData.FNumber)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">快門速度</dt>
                    <dd className="text-white font-medium">
                      {formatExifValue("ExposureTime", exifData.ExposureTime)}
                    </dd>
                  </div>
                  {exifData.FocalLength && (
                    <div className="flex justify-between">
                      <dt className="text-white/60">焦距</dt>
                      <dd className="text-white font-medium">
                        {formatExifValue("FocalLength", exifData.FocalLength)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard hints */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-white/60">
        <span>ESC 關閉</span>
        {(onPrev || onNext) && <span>← → 切換</span>}
        <span>I 資訊</span>
      </div>
    </div>
  );
}

// Export a hook version for React 19
const React = require("react");
