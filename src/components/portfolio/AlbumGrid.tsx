import type { Album } from '@/types/photos';
import AlbumCard from './AlbumCard';
import { Container } from '@/components/Container';

interface AlbumGridProps {
  albums: Album[];
}

export default function AlbumGrid({ albums }: AlbumGridProps) {
  if (albums.length === 0) return null;

  return (
    <section className="mb-12">
      <Container className="mb-6">
        <div className="flex items-baseline pb-3 gap-3 border-b border-border">
          <span className="text-xs font-light text-muted-foreground/70 tabular-nums">02</span>
          <span className="tracking-[0.18em] uppercase text-xs font-semibold text-muted-foreground">
            Albums
          </span>
          <span className="ml-auto text-xs font-light text-muted-foreground/70 tabular-nums">
            {albums.length}
          </span>
        </div>
      </Container>

      <Container>
        <div className="overflow-x-auto -mx-6 px-6">
          <div className="flex gap-3 pb-4">
            {albums.map((album) => (
              <AlbumCard key={album.slug} album={album} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
