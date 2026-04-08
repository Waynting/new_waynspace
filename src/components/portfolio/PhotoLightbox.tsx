'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Photo } from '@/types/photos';
import PhotoExifTable from './PhotoExifTable';
import TagList from './TagList';

interface PhotoLightboxProps {
  photo: Photo;
  photos: Photo[];
  onClose: () => void;
  onNavigate: (photo: Photo) => void;
}

export default function PhotoLightbox({
  photo,
  photos,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  const currentIndex = photos.findIndex((p) => p.id === photo.id);

  const navigate = useCallback(
    (direction: 'prev' | 'next') => {
      const newIndex =
        direction === 'prev'
          ? (currentIndex - 1 + photos.length) % photos.length
          : (currentIndex + 1) % photos.length;
      onNavigate(photos[newIndex]);
    },
    [currentIndex, photos, onNavigate]
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') navigate('prev');
      else if (e.key === 'ArrowRight') navigate('next');
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose, navigate]);

  const dateTaken = new Date(photo.dateTaken);
  const dateStr = dateTaken.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
        <p className="text-xs text-white/40 tabular-nums">
          {currentIndex + 1} / {photos.length}
        </p>
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Photo area */}
      <div className="flex-1 relative flex items-center justify-center min-h-0">
        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('prev');
              }}
              className="absolute left-5 z-10 text-white/50 hover:text-white transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('next');
              }}
              className="absolute right-5 z-10 text-white/50 hover:text-white transition-colors"
              aria-label="Next"
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
            src={photo.urls.display}
            alt={photo.title}
            width={1600}
            height={Math.round(1600 / (photo.aspectRatio || 1.5))}
            quality={90}
            className="max-w-full max-h-[70vh] object-contain"
            sizes="100vw"
            priority
          />
        </div>
      </div>

      {/* Info panel */}
      <div
        className="flex-shrink-0 px-5 py-4 max-h-[25vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-2xl mx-auto">
          <p className="text-white text-sm font-medium">{photo.title}</p>
          <p className="text-white/50 text-xs mt-1">
            {dateStr}
            {photo.location?.name && ` · ${photo.location.name}`}
          </p>

          {photo.description && (
            <p className="text-white/60 text-xs mt-3 leading-relaxed">
              {photo.description}
            </p>
          )}

          {photo.exif && (
            <div className="mt-3 [&_p]:text-white/60 [&_p]:text-xs">
              <PhotoExifTable exif={photo.exif} />
            </div>
          )}

          {photo.tags.length > 0 && (
            <div className="mt-3 [&_span]:text-white/40 [&_span]:text-xs [&_a]:text-white/40 [&_a]:text-xs [&_a:hover]:text-white/70">
              <TagList tags={photo.tags} linkable={false} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
