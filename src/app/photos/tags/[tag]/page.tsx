import { Metadata } from 'next';
import Link from 'next/link';
import PhotoGrid from '@/components/portfolio/PhotoGrid';
import { getPhotosByTag, getAllTags } from '@/lib/portfolio';

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((t) => ({ tag: t.tag }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `#${tag} — 攝影作品集`,
    description: `Photos tagged with "${tag}"`,
  };
}

export const revalidate = 3600;

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const photos = await getPhotosByTag(tag);

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
            Tag
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            #{tag}
          </h1>
          <p className="text-sm text-muted-foreground tabular-nums">
            {photos.length} photos
          </p>
        </header>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-20">
        <PhotoGrid photos={photos} />
      </div>
    </>
  );
}
