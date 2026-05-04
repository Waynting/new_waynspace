'use client';

import { useState, useMemo } from 'react';
import type { Photo, Album } from '@/types/photos';
import FeaturedPhotos from './FeaturedPhotos';
import AlbumGrid from './AlbumGrid';
import PhotoGrid from './PhotoGrid';
import PhotoLightbox from './PhotoLightbox';
import { Container } from '@/components/Container';
import { SectionDivider } from '@/components/SectionDivider';

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

      <AlbumGrid albums={albums} />

      <section className="mb-16">
        <Container className="mb-8">
          <SectionDivider
            title="All Photos."
            tagline="— full archive"
            right={
              <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-foreground/65 whitespace-nowrap">
                {allPhotos.length} TOTAL
              </span>
            }
          />
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
