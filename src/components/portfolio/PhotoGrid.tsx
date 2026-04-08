'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import type { Photo } from '@/types/photos';
import PhotoLightbox from './PhotoLightbox';
import { trackPhotoView } from '@/lib/analytics';

interface PhotoGridProps {
  photos: Photo[];
  columns?: number;
  perPage?: number;
  onPhotoClick?: (photo: Photo, index: number) => void;
}

const PHOTOS_PER_PAGE = 24;

export default function PhotoGrid({
  photos,
  columns,
  perPage = PHOTOS_PER_PAGE,
  onPhotoClick,
}: PhotoGridProps) {
  const [visibleCount, setVisibleCount] = useState(perPage);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const visible = photos.slice(0, visibleCount);
  const hasMore = visibleCount < photos.length;

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    setVisibleCount((v) => Math.min(v + perPage, photos.length));
  }, [hasMore, perPage, photos.length]);

  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const openPhoto = useCallback(
    (photo: Photo, index: number) => {
      trackPhotoView(index);
      if (onPhotoClick) {
        onPhotoClick(photo, index);
      } else {
        setSelectedPhoto(photo);
      }
    },
    [onPhotoClick]
  );

  const colClass = columns
    ? `columns-${columns}`
    : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4';

  return (
    <>
      <div className={`${colClass} gap-1`}>
        {visible.map((photo, index) => (
          <div
            key={photo.id}
            className="break-inside-avoid mb-1 group relative overflow-hidden bg-muted cursor-pointer"
            onClick={() => openPhoto(photo, index)}
          >
            <Image
              src={photo.urls.thumb}
              alt={photo.title}
              width={600}
              height={Math.round(600 / (photo.aspectRatio || 1.5))}
              quality={75}
              className="w-full h-auto block"
              loading={index < 8 ? 'eager' : 'lazy'}
              priority={index < 4}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-300 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <p className="text-white text-xs font-medium truncate">
                {photo.title}
              </p>
              {photo.location?.name && (
                <p className="text-white/60 text-[10px] mt-0.5">
                  {photo.location.name}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div ref={loadMoreRef} className="py-10 flex justify-center">
          <span className="text-xs text-muted-foreground/40 tabular-nums">
            loading
          </span>
        </div>
      )}

      {!onPhotoClick && selectedPhoto && (
        <PhotoLightbox
          photo={selectedPhoto}
          photos={photos}
          onClose={() => setSelectedPhoto(null)}
          onNavigate={setSelectedPhoto}
        />
      )}
    </>
  );
}
