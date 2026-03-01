'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface Photo {
  url: string;
  key: string;
  name: string;
  size: number;
  lastModified: string;
}

interface PhotoGalleryProps {
  initialPhotos: Photo[];
}

interface PhotoPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PHOTOS_PER_PAGE = 24;

export default function PhotoGallery({ initialPhotos }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos.slice(0, PHOTOS_PER_PAGE));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPhotos.length > PHOTOS_PER_PAGE);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, boolean>>({});
  const [imageDimensions, setImageDimensions] = useState<Record<string, { width: number; height: number }>>({});

  const [columnCount, setColumnCount] = useState(4);
  const [gapSize, setGapSize] = useState(4);
  const [photoPositions, setPhotoPositions] = useState<Record<string, PhotoPosition>>({});
  const [containerHeight, setContainerHeight] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const currentPageRef = useRef(1);

  // Responsive column + gap calculation
  useEffect(() => {
    let rafId: number | null = null;

    const calculateLayout = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      let cols = 1, gap = 6;

      if (width >= 1600)      { cols = 5; gap = 12; }
      else if (width >= 1400) { cols = 4; gap = 10; }
      else if (width >= 1200) { cols = 4; gap = 10; }
      else if (width >= 1024) { cols = 3; gap = 8;  }
      else if (width >= 768)  { cols = 3; gap = 6;  }
      else if (width >= 640)  { cols = 2; gap = 6;  }
      else                    { cols = 1; gap = 4;  }

      setColumnCount(cols);
      setGapSize(gap);
    };

    const throttled = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => { calculateLayout(); rafId = null; });
    };

    calculateLayout();
    const ro = new ResizeObserver(throttled);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', throttled, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', throttled);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  // Masonry layout calculation
  useEffect(() => {
    if (columnCount === 0 || photos.length === 0) {
      setPhotoPositions({});
      setContainerHeight(0);
      return;
    }

    let rafId: number | null = null;

    const calculateLayout = () => {
      const containerWidth = containerRef.current?.offsetWidth;
      if (!containerWidth) return;

      const totalGapWidth = gapSize * (columnCount - 1);
      const columnWidth = Math.floor((containerWidth - totalGapWidth) / columnCount);
      const columnHeights = new Array(columnCount).fill(0);
      const positions: Record<string, PhotoPosition> = {};

      photos.forEach((photo) => {
        const dimensions = imageDimensions[photo.key];
        if (!dimensions) return;

        const aspectRatio = dimensions.width / dimensions.height;
        const height = columnWidth / aspectRatio;
        const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
        const left = shortestColumnIndex * (columnWidth + gapSize);
        const top = columnHeights[shortestColumnIndex];

        positions[photo.key] = { top, left, width: columnWidth, height };
        columnHeights[shortestColumnIndex] += height + gapSize;
      });

      setPhotoPositions(positions);
      setContainerHeight(Math.max(...columnHeights, 0));
    };

    rafId = requestAnimationFrame(calculateLayout);
    return () => { if (rafId !== null) cancelAnimationFrame(rafId); };
  }, [photos, imageDimensions, columnCount, gapSize]);

  // Infinite scroll
  const loadMorePhotos = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = currentPageRef.current + 1;
    const startIndex = currentPageRef.current * PHOTOS_PER_PAGE;
    const endIndex = startIndex + PHOTOS_PER_PAGE;
    const newPhotos = initialPhotos.slice(startIndex, endIndex);

    if (newPhotos.length > 0) {
      setTimeout(() => {
        setPhotos(prev => [...prev, ...newPhotos]);
        currentPageRef.current = nextPage;
        setHasMore(endIndex < initialPhotos.length);
        setLoading(false);
      }, 100);
    } else {
      setHasMore(false);
      setLoading(false);
    }
  }, [initialPhotos, loading, hasMore]);

  useEffect(() => {
    if (!hasMore || loading) return;
    observerRef.current = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMorePhotos(); },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => { observerRef.current?.disconnect(); };
  }, [hasMore, loading, loadMorePhotos]);

  // Lightbox open/close/navigate
  const openPhoto = useCallback((photo: Photo) => {
    setSelectedPhoto(photo);
    document.body.style.overflow = 'hidden';
  }, []);

  const closePhoto = useCallback(() => {
    setSelectedPhoto(null);
    document.body.style.overflow = 'unset';
  }, []);

  const navigatePhoto = useCallback((direction: 'prev' | 'next') => {
    setSelectedPhoto((current) => {
      if (!current) return null;
      const idx = initialPhotos.findIndex(p => p.key === current.key);
      if (idx === -1) return current;

      const newIdx = direction === 'prev'
        ? (idx - 1 + initialPhotos.length) % initialPhotos.length
        : (idx + 1) % initialPhotos.length;
      const newPhoto = initialPhotos[newIdx];

      setPhotos((currentPhotos) => {
        if (currentPhotos.find(p => p.key === newPhoto.key)) return currentPhotos;
        const targetPage = Math.floor(newIdx / PHOTOS_PER_PAGE) + 1;
        if (targetPage > currentPageRef.current) {
          const endIndex = targetPage * PHOTOS_PER_PAGE;
          currentPageRef.current = targetPage;
          setHasMore(endIndex < initialPhotos.length);
          return initialPhotos.slice(0, endIndex);
        }
        return currentPhotos;
      });

      return newPhoto;
    });
  }, [initialPhotos]);

  // Keyboard navigation
  useEffect(() => {
    if (!selectedPhoto) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePhoto();
      else if (e.key === 'ArrowLeft') navigatePhoto('prev');
      else if (e.key === 'ArrowRight') navigatePhoto('next');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedPhoto, navigatePhoto, closePhoto]);

  if (photos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-muted-foreground">No photos found</p>
      </div>
    );
  }

  return (
    <>
      {/* Masonry grid */}
      <div
        ref={containerRef}
        className="w-full relative"
        style={{ minHeight: containerHeight > 0 ? `${containerHeight}px` : '400px' }}
      >
        {photos.map((photo, index) => {
          const position = photoPositions[photo.key];
          const dimensions = imageDimensions[photo.key];
          const isLoaded = imageLoadStates[photo.key];

          const sharedOnLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
            const img = e.currentTarget;
            setImageLoadStates(prev => ({ ...prev, [photo.key]: true }));
            setImageDimensions(prev => ({
              ...prev,
              [photo.key]: { width: img.naturalWidth, height: img.naturalHeight },
            }));
          };

          if (!position) {
            return (
              <div
                key={photo.key}
                className="group relative overflow-hidden bg-muted cursor-pointer"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  maxWidth: '300px',
                  aspectRatio: dimensions ? `${dimensions.width / dimensions.height}` : '1',
                  opacity: isLoaded ? 1 : 0.4,
                }}
                onClick={() => openPhoto(photo)}
              >
                {!isLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/50" />
                  </div>
                )}
                <Image
                  src={photo.url}
                  alt={photo.name}
                  fill
                  loading={index < 8 ? 'eager' : 'lazy'}
                  priority={index < 4}
                  className={cn('object-contain transition-opacity duration-200', !isLoaded && 'opacity-0')}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  unoptimized={photo.url.startsWith('http')}
                  onLoad={sharedOnLoad}
                />
              </div>
            );
          }

          return (
            <div
              key={photo.key}
              className="group absolute overflow-hidden bg-muted cursor-pointer"
              style={{
                transform: `translate(${position.left}px, ${position.top}px)`,
                width: `${position.width}px`,
                height: `${position.height}px`,
                willChange: 'transform',
              }}
              onClick={() => openPhoto(photo)}
            >
              {/* Hover overlay — editorial: very subtle darkening */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-300 z-[1] pointer-events-none" />

              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/50" />
                </div>
              )}
              <Image
                src={photo.url}
                alt={photo.name}
                fill
                loading={index < 8 ? 'eager' : 'lazy'}
                priority={index < 4}
                className={cn('object-contain transition-opacity duration-200', !isLoaded && 'opacity-0')}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                unoptimized={photo.url.startsWith('http')}
                onLoad={sharedOnLoad}
              />
            </div>
          );
        })}
      </div>

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex items-center justify-center py-10">
          {loading && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/40" />
          )}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (() => {
        const currentIndex = initialPhotos.findIndex(p => p.key === selectedPhoto.key);
        return (
          <div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={closePhoto}
          >
            {/* Close */}
            <button
              onClick={closePhoto}
              className="absolute top-5 right-5 z-10 text-white/50 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Prev / Next */}
            {initialPhotos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigatePhoto('prev'); }}
                  className="absolute left-5 z-10 text-white/50 hover:text-white transition-colors"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigatePhoto('next'); }}
                  className="absolute right-5 z-10 text-white/50 hover:text-white transition-colors"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-6 h-6" strokeWidth={1.5} />
                </button>
              </>
            )}

            {/* Image */}
            <div
              className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center px-16"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.name}
                width={1920}
                height={1080}
                className="max-w-full max-h-full object-contain"
                unoptimized={selectedPhoto.url.startsWith('http')}
                priority
                quality={90}
              />
            </div>

            {/* Caption */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 text-center">
              <p className="text-xs text-white/40 tabular-nums">
                {currentIndex + 1} / {initialPhotos.length}
              </p>
            </div>
          </div>
        );
      })()}
    </>
  );
}
