import { Metadata } from 'next';
import PortfolioHeader from '@/components/portfolio/PortfolioHeader';
import PortfolioClient from '@/components/portfolio/PortfolioClient';
import { getPortfolioIndex } from '@/lib/portfolio';
import type { Photo } from '@/types/photos';

export const metadata: Metadata = {
  title: '攝影作品集',
  description: '街頭攝影、城市漫步與日常隨拍。Wei-Ting Liu 的個人攝影作品集。',
};

export const revalidate = 3600;

// Strip heavy fields before sending to client
function toGridPhoto(p: Photo) {
  return {
    id: p.id,
    title: p.title,
    dateTaken: p.dateTaken,
    dateUploaded: p.dateUploaded,
    tags: p.tags,
    albumSlugs: p.albumSlugs,
    featured: p.featured,
    aspectRatio: p.aspectRatio,
    urls: p.urls,
    location: p.location ? { name: p.location.name } : undefined,
    exif: p.exif,
  };
}

export default async function PhotosPage() {
  const { photos, albums } = await getPortfolioIndex();

  const sorted = [...photos].sort(
    (a, b) =>
      new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime()
  );

  const featured = photos.filter((p) => p.featured).slice(0, 5);
  const featuredPhotos =
    featured.length > 0 ? featured : sorted.slice(0, 5);

  return (
    <>
      <PortfolioHeader
        photoCount={photos.length}
        albumCount={albums.length}
      />
      <PortfolioClient
        featuredPhotos={featuredPhotos.map(toGridPhoto)}
        albums={albums}
        recentPhotos={sorted.slice(0, 12).map(toGridPhoto)}
        allPhotos={sorted.map(toGridPhoto)}
      />
    </>
  );
}
