'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

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

const PHOTOS_PER_PAGE = 24;

export default function PhotoGallery({ initialPhotos }: PhotoGalleryProps) {
  const [visibleCount, setVisibleCount] = useState(PHOTOS_PER_PAGE);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const photos = initialPhotos.slice(0, visibleCount);
  const hasMore = visibleCount < initialPhotos.length;

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    setVisibleCount(v => Math.min(v + PHOTOS_PER_PAGE, initialPhotos.length));
    setLoading(false);
  }, [loading, hasMore, initialPhotos.length]);

  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  // Lightbox
  const openPhoto = useCallback((photo: Photo) => {
    setSelectedPhoto(photo);
    document.body.style.overflow = 'hidden';
  }, []);

  const closePhoto = useCallback(() => {
    setSelectedPhoto(null);
    document.body.style.overflow = '';
  }, []);

  const navigatePhoto = useCallback((direction: 'prev' | 'next') => {
    setSelectedPhoto(current => {
      if (!current) return null;
      const idx = initialPhotos.findIndex(p => p.key === current.key);
      if (idx === -1) return current;
      const newIdx = direction === 'prev'
        ? (idx - 1 + initialPhotos.length) % initialPhotos.length
        : (idx + 1) % initialPhotos.length;
      return initialPhotos[newIdx];
    });
  }, [initialPhotos]);

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

  const currentIndex = selectedPhoto
    ? initialPhotos.findIndex(p => p.key === selectedPhoto.key)
    : -1;

  return (
    <>
      {/* CSS columns masonry — renders immediately, no JS layout blocking */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-1">
        {photos.map((photo, index) => (
          <div
            key={photo.key}
            className="break-inside-avoid mb-1 group relative overflow-hidden bg-muted cursor-pointer"
            onClick={() => openPhoto(photo)}
          >
            <Image
              src={photo.url}
              alt={photo.name}
              width={800}
              height={600}
              className="w-full h-auto block"
              loading={index < 8 ? 'eager' : 'lazy'}
              priority={index < 4}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-300 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-10 flex justify-center">
          {loading && (
            <span className="text-xs text-muted-foreground/40 tabular-nums">loading</span>
          )}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={closePhoto}
        >
          <button
            onClick={closePhoto}
            className="absolute top-5 right-5 z-10 text-white/50 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>

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

          <div
            className="w-full h-full flex items-center justify-center px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              width={1920}
              height={1080}
              className="max-w-full max-h-[90vh] object-contain"
              unoptimized={selectedPhoto.url.startsWith('http')}
              priority
            />
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
            <p className="text-xs text-white/40 tabular-nums">
              {currentIndex + 1} / {initialPhotos.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
