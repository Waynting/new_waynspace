'use client';

import { useState, useMemo } from 'react';
import type { Photo, Album } from '@/types/photos';
import FeaturedPhotos from './FeaturedPhotos';
import AlbumGrid from './AlbumGrid';
import PhotoGrid from './PhotoGrid';
import PhotoLightbox from './PhotoLightbox';

interface PortfolioClientProps {
  featuredPhotos: Photo[];
  albums: Album[];
  recentPhotos: Photo[];
  allPhotos: Photo[];
}

export default function PortfolioClient({
  featuredPhotos,
  albums,
  recentPhotos,
  allPhotos,
}: PortfolioClientProps) {
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);

  // Single deduplicated photo list for lightbox navigation
  const lightboxPhotos = useMemo(() => {
    const seen = new Set<string>();
    const result: Photo[] = [];
    for (const p of allPhotos) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        result.push(p);
      }
    }
    return result;
  }, [allPhotos]);

  const handlePhotoClick = (photo: Photo) => {
    setLightboxPhoto(photo);
  };

  return (
    <>
      <FeaturedPhotos
        photos={featuredPhotos}
        onPhotoClick={handlePhotoClick}
      />

      <AlbumGrid albums={albums} sectionNumber="02" />

      {/* All Photos */}
      <section className="mb-16">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 mb-8">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <span className="text-xs text-muted-foreground font-light tabular-nums">
              03
            </span>
            <h2 className="text-xs text-muted-foreground font-medium tracking-[0.18em] uppercase">
              All Photos
            </h2>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8">
          <PhotoGrid photos={allPhotos} onPhotoClick={handlePhotoClick} />
        </div>
      </section>

      {lightboxPhoto && (
        <PhotoLightbox
          photo={lightboxPhoto}
          photos={lightboxPhotos}
          onClose={() => setLightboxPhoto(null)}
          onNavigate={setLightboxPhoto}
        />
      )}
    </>
  );
}
