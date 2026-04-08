import Image from 'next/image';
import type { Photo } from '@/types/photos';

interface FeaturedPhotosProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
}

export default function FeaturedPhotos({ photos, onPhotoClick }: FeaturedPhotosProps) {
  if (photos.length === 0) return null;

  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 mb-16">
      <div className="flex items-center gap-3 border-b border-border pb-3 mb-8">
        <span className="text-xs text-muted-foreground font-light tabular-nums">
          01
        </span>
        <h2 className="text-xs text-muted-foreground font-medium tracking-[0.18em] uppercase">
          Featured
        </h2>
      </div>

      <div className="space-y-2">
        {/* First photo large */}
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
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-sm font-medium">{photos[0].title}</p>
              {photos[0].location?.name && (
                <p className="text-white/60 text-xs mt-1">{photos[0].location.name}</p>
              )}
            </div>
          </div>
        )}

        {/* Remaining photos in 2-column grid */}
        {photos.length > 1 && (
          <div className="grid grid-cols-2 gap-2">
            {photos.slice(1).map((photo) => (
              <div
                key={photo.id}
                className="group relative overflow-hidden bg-muted cursor-pointer"
                style={{ aspectRatio: photo.aspectRatio || 3 / 2 }}
                onClick={() => onPhotoClick?.(photo)}
              >
                <Image
                  src={photo.urls.display}
                  alt={photo.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 384px"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-xs font-medium">{photo.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
