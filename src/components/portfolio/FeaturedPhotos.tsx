import Image from 'next/image';
import type { Photo } from '@/types/photos';
import { Container } from '@/components/Container';

interface FeaturedPhotosProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
}

export default function FeaturedPhotos({ photos, onPhotoClick }: FeaturedPhotosProps) {
  if (photos.length === 0) return null;

  return (
    <section className="mb-12">
      <Container className="mb-6">
        <div className="flex items-baseline pb-3 gap-3 border-b border-border">
          <span className="text-xs font-light text-muted-foreground/70 tabular-nums">01</span>
          <span className="tracking-[0.18em] uppercase text-xs font-semibold text-muted-foreground">
            Featured
          </span>
          <span className="ml-auto text-xs font-light text-muted-foreground/70 tabular-nums">
            {photos.length}
          </span>
        </div>
      </Container>

      <Container>
        <div className="flex flex-col gap-2">
          {photos[0] && (
            <div
              className="group relative overflow-hidden bg-muted cursor-pointer"
              style={{ aspectRatio: photos[0].aspectRatio || 3 / 2 }}
              onClick={() => onPhotoClick?.(photos[0])}
            >
              <Image
                src={photos[0].urls.display}
                alt={photos[0].title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 720px"
                priority
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-sm font-medium">{photos[0].title}</p>
                {photos[0].location?.name && (
                  <p className="text-white/70 text-xs mt-1">{photos[0].location.name}</p>
                )}
              </div>
            </div>
          )}

          {photos.length > 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {photos.slice(1, 5).map((photo) => (
                <div
                  key={photo.id}
                  className="group relative overflow-hidden bg-muted cursor-pointer"
                  style={{ aspectRatio: photo.aspectRatio || 1 }}
                  onClick={() => onPhotoClick?.(photo)}
                >
                  <Image
                    src={photo.urls.display}
                    alt={photo.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 180px"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  {photo.location?.name && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-[11px] font-medium">{photo.location.name}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
