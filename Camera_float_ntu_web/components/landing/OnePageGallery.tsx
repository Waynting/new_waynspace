"use client";

import { useState, useEffect, useCallback } from "react";
import { PhotoWithExif } from "@/types";
import { FolderSelector } from "./FolderSelector";
import { LayoutSelector, LayoutType } from "@/components/gallery/LayoutSelector";
import { MasonryGrid } from "@/components/gallery/MasonryGrid";
import { StaggeredGrid } from "@/components/gallery/StaggeredGrid";
import { CarouselGrid } from "@/components/gallery/CarouselGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiPath } from "@/lib/utils";

export function OnePageGallery() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [layout, setLayout] = useState<LayoutType>("masonry");
  const [photos, setPhotos] = useState<PhotoWithExif[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // 从 localStorage 加载用户偏好
  useEffect(() => {
    const savedLayout = localStorage.getItem("photo_layout") as LayoutType;
    if (savedLayout && ["masonry", "staggered", "carousel"].includes(savedLayout)) {
      setLayout(savedLayout);
    }
  }, []);

  // 保存布局偏好
  useEffect(() => {
    localStorage.setItem("photo_layout", layout);
  }, [layout]);

  // 加载照片
  const loadPhotos = useCallback(async (folderName: string | null) => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      if (!folderName) {
        // 如果没有选择文件夹，清空照片列表
        // 用户可以点击侧边栏的文件夹来加载照片
        setPhotos([]);
        setIsLoading(false);
        return;
      }

      // 获取照片列表
      const response = await fetch(
        getApiPath(`/api/photos?folder=${encodeURIComponent(folderName)}&page=1&pageSize=100`)
      );

      if (!response.ok) {
        throw new Error("Failed to fetch photos");
      }

      const data = await response.json();
      const photosList = data.photos || [];
      // API 已经返回了包含 URL 的照片
      setPhotos(photosList);
    } catch (error) {
      console.error("Error loading photos:", error);
      setHasError(true);
      setPhotos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 当文件夹改变时加载照片
  useEffect(() => {
    loadPhotos(selectedFolder);
  }, [selectedFolder, loadPhotos]);

  // 渲染照片网格
  const renderPhotoGrid = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="w-full aspect-square" />
          ))}
        </div>
      );
    }

    if (hasError) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p>載入照片時發生錯誤，請稍後再試。</p>
        </div>
      );
    }

    if (photos.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p>目前沒有照片。</p>
          {!selectedFolder && <p className="mt-2 text-sm">請選擇一個資料夾來瀏覽照片。</p>}
        </div>
      );
    }

    switch (layout) {
      case "masonry":
        return <MasonryGrid photos={photos} gap={16} />;
      case "staggered":
        return <StaggeredGrid photos={photos} gap={16} />;
      case "carousel":
        return <CarouselGrid photos={photos} gap={16} itemsPerView={3} />;
      default:
        return <MasonryGrid photos={photos} gap={16} />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="space-y-4 sm:space-y-6 py-8 sm:py-12 px-4 sm:px-6">
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            相機漂流計劃 台大 Ver.
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            相機共享計劃，記錄校園生活的美好瞬間
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-6 pb-12">
        {/* Sidebar - Folder Selector (Desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <FolderSelector
              selectedFolder={selectedFolder}
              onFolderChange={setSelectedFolder}
            />
          </div>
        </aside>

        {/* Main Gallery Area */}
        <main className="flex-1 min-w-0">
          {/* Mobile Folder Selector & Layout Selector */}
          <div className="lg:hidden mb-6 space-y-4">
            <FolderSelector
              selectedFolder={selectedFolder}
              onFolderChange={setSelectedFolder}
            />
          </div>

          {/* Layout Selector */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold">
              {selectedFolder ? selectedFolder : "全部照片"}
            </h2>
            <LayoutSelector currentLayout={layout} onLayoutChange={setLayout} />
          </div>

          {/* Photo Grid */}
          {renderPhotoGrid()}
        </main>
      </div>
    </div>
  );
}

