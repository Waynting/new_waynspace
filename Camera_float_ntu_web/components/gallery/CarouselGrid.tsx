"use client";

import { useState, useRef, useEffect } from "react";
import { PhotoWithExif } from "@/types";
import { PhotoCard } from "./PhotoCard";
import { ExhibitionViewer } from "./ExhibitionViewer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselGridProps {
  photos: PhotoWithExif[];
  gap?: number;
  itemsPerView?: number;
}

export function CarouselGrid({ photos, gap = 16, itemsPerView = 3 }: CarouselGridProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState(itemsPerView);

  useEffect(() => {
    const updateVisibleItems = () => {
      if (!scrollContainerRef.current) return;
      const width = scrollContainerRef.current.offsetWidth;
      if (width < 640) setVisibleItems(1);
      else if (width < 1024) setVisibleItems(2);
      else if (width < 1536) setVisibleItems(3);
      else setVisibleItems(4);
    };

    updateVisibleItems();
    window.addEventListener("resize", updateVisibleItems, { passive: true });
    return () => window.removeEventListener("resize", updateVisibleItems);
  }, []);

  const maxIndex = Math.max(0, photos.length - visibleItems);

  const scrollToIndex = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(clampedIndex);
    
    if (scrollContainerRef.current) {
      const itemWidth = scrollContainerRef.current.offsetWidth / visibleItems;
      scrollContainerRef.current.scrollTo({
        left: clampedIndex * itemWidth,
        behavior: "smooth",
      });
    }
  };

  const handlePrev = () => {
    scrollToIndex(currentIndex - 1);
  };

  const handleNext = () => {
    scrollToIndex(currentIndex + 1);
  };

  const visiblePhotos = photos.slice(currentIndex, currentIndex + visibleItems);

  return (
    <>
      <div className="relative w-full">
        {/* Navigation Buttons */}
        {photos.length > visibleItems && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Carousel Container */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{
            gap: `${gap}px`,
          }}
        >
          {photos.map((photo, index) => (
            <div
              key={photo.key}
              className="flex-shrink-0 snap-start"
              style={{
                width: `calc((100% - ${gap * (visibleItems - 1)}px) / ${visibleItems})`,
                minWidth: `calc((100% - ${gap * (visibleItems - 1)}px) / ${visibleItems})`,
              }}
            >
              <PhotoCard
                photo={photo}
                onClick={() => setViewerIndex(index)}
              />
            </div>
          ))}
        </div>

        {/* Indicators */}
        {photos.length > visibleItems && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: Math.ceil(photos.length / visibleItems) }).map((_, i) => {
              const startIndex = i * visibleItems;
              const isActive = currentIndex >= startIndex && currentIndex < startIndex + visibleItems;
              return (
                <button
                  key={i}
                  onClick={() => scrollToIndex(startIndex)}
                  className={`h-2 rounded-full transition-all ${
                    isActive ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              );
            })}
          </div>
        )}
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

