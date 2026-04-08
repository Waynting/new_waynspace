import type { Album } from '@/types/photos';
import AlbumCard from './AlbumCard';

interface AlbumGridProps {
  albums: Album[];
  sectionNumber?: string;
}

export default function AlbumGrid({ albums, sectionNumber = '02' }: AlbumGridProps) {
  if (albums.length === 0) return null;

  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 mb-16">
      <div className="flex items-center gap-3 border-b border-border pb-3 mb-8">
        <span className="text-xs text-muted-foreground font-light tabular-nums">
          {sectionNumber}
        </span>
        <h2 className="text-xs text-muted-foreground font-medium tracking-[0.18em] uppercase">
          Albums
        </h2>
      </div>

      <div className="overflow-x-auto -mx-6 sm:-mx-8 lg:-mx-12 px-6 sm:px-8 lg:px-12">
        <div className="flex gap-3 pb-4">
          {albums.map((album) => (
            <AlbumCard key={album.slug} album={album} />
          ))}
        </div>
      </div>
    </section>
  );
}
