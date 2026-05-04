import type { Album } from '@/types/photos';
import AlbumCard from './AlbumCard';
import { Container } from '@/components/Container';
import { SectionDivider } from '@/components/SectionDivider';

interface AlbumGridProps {
  albums: Album[];
}

export default function AlbumGrid({ albums }: AlbumGridProps) {
  if (albums.length === 0) return null;

  return (
    <section className="mb-16">
      <Container className="mb-8">
        <SectionDivider
          title="Albums."
          tagline="— collected sets"
          right={
            <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-foreground/65 whitespace-nowrap">
              {albums.length} ALBUMS
            </span>
          }
        />
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
