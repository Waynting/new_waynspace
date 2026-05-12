'use client';

import { useState, useMemo } from 'react';
import type { Photo, Album } from '@/types/photos';
import FeaturedPhotos from './FeaturedPhotos';
import AlbumGrid from './AlbumGrid';
import PhotoGrid from './PhotoGrid';
import PhotoLightbox from './PhotoLightbox';
import { Container } from '@/components/Container';

interface PortfolioClientProps {
  featuredPhotos: Photo[];
  albums: Album[];
  recentPhotos: Photo[];
  allPhotos: Photo[];
}

export default function PortfolioClient({
  featuredPhotos,
  albums,
  allPhotos,
}: PortfolioClientProps) {
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);

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

      <AlbumGrid albums={albums} />

      <section className="mb-16">
        <Container className="mb-6">
          <div className="flex items-baseline pb-3 gap-3 border-b border-border">
            <span className="text-xs font-light text-muted-foreground/70 tabular-nums">03</span>
            <span className="tracking-[0.18em] uppercase text-xs font-semibold text-muted-foreground">
              All Photos
            </span>
            <span className="ml-auto text-xs font-light text-muted-foreground/70 tabular-nums">
              {allPhotos.length}
            </span>
          </div>
        </Container>

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
