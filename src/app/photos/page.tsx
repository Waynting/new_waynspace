import { Metadata } from 'next';
import PhotoGallery from '@/components/PhotoGallery';
import { getPhotos } from '@/lib/photos';

export const metadata: Metadata = {
  title: 'Photos - Wei-Ting Liu',
  description: 'Personal photography gallery by Wei-Ting Liu',
};

export const revalidate = 3600;

export default async function PhotosPage() {
  const photos = await getPhotos();

  return (
    <>
      {/* Editorial header — matches /about and /blog */}
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-20">
        <header>
          <p className="text-xs text-muted-foreground font-medium tracking-[0.2em] uppercase mb-4">
            Wei-Ting Liu
          </p>
          <div className="flex items-baseline gap-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Photos</h1>
            {photos.length > 0 && (
              <span className="text-sm text-muted-foreground font-light tabular-nums">
                {photos.length}
              </span>
            )}
          </div>
        </header>
      </div>

      {/* Gallery — full bleed with consistent horizontal padding */}
      <div className="px-4 sm:px-6 lg:px-8 pb-20">
        <PhotoGallery initialPhotos={photos} />
      </div>
    </>
  );
}
