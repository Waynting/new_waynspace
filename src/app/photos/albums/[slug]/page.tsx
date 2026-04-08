import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PhotoGrid from '@/components/portfolio/PhotoGrid';
import { getAlbums, getAlbumBySlug, getAlbumPhotos } from '@/lib/portfolio';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const albums = await getAlbums();
  return albums.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) return { title: 'Album Not Found' };

  return {
    title: `${album.title} — 攝影作品集`,
    description:
      album.description ||
      `${album.title}${album.location?.name ? ` · ${album.location.name}` : ''} — ${album.photoCount} photos`,
    openGraph: album.coverUrl
      ? { images: [{ url: album.coverUrl, width: 1600 }] }
      : undefined,
  };
}

export const revalidate = 3600;

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params;
  const [album, photos] = await Promise.all([
    getAlbumBySlug(slug),
    getAlbumPhotos(slug),
  ]);

  if (!album) notFound();

  const dateStr = album.dateCaptured || '';

  return (
    <>
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-20">
        <Link
          href="/photos"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
        >
          ← Photos
        </Link>

        <header>
          <p className="text-xs text-muted-foreground font-medium tracking-[0.2em] uppercase mb-4">
            Album
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            {album.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {dateStr && <span>{dateStr}</span>}
            {dateStr && album.location?.name && <span>·</span>}
            {album.location?.name && <span>{album.location.name}</span>}
            <span>·</span>
            <span className="tabular-nums">{photos.length} photos</span>
          </div>
          {album.description && (
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed max-w-xl">
              {album.description}
            </p>
          )}
        </header>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-20">
        <PhotoGrid photos={photos} />
      </div>
    </>
  );
}
