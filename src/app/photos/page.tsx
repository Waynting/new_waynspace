import { Metadata } from 'next';
import PhotoGallery from '@/components/PhotoGallery';
import { getPhotos } from '@/lib/photos';

export const metadata: Metadata = {
  title: '攝影作品集',
  description: '街頭攝影、城市漫步與日常隨拍。Wei-Ting Liu 的個人攝影作品集。',
};

export const revalidate = 3600;

export default async function PhotosPage() {
  const photos = await getPhotos();

  return (
    <>
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

      <div className="px-4 sm:px-6 lg:px-8 pb-20">
        <PhotoGallery initialPhotos={photos} />
      </div>
    </>
  );
}
