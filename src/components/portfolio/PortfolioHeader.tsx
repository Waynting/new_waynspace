import Image from 'next/image';
import { Container } from '@/components/Container';
import { MastheadStrip } from '@/components/MastheadStrip';
import { buildPhotoCover, formatDateLabel } from '@/lib/format';
import type { Photo } from '@/types/photos';

interface PortfolioHeaderProps {
  photoCount: number;
  albumCount: number;
  coverPhoto?: Photo | null;
}

export default function PortfolioHeader({
  photoCount,
  albumCount,
  coverPhoto,
}: PortfolioHeaderProps) {
  const dateLabel = formatDateLabel();
  const cover = coverPhoto ? buildPhotoCover(coverPhoto) : null;

  return (
    <Container className="pt-20 pb-12">
      <MastheadStrip
        primary="SECTION 02 / FIELD NOTES"
        secondary="攝影集"
        right={`UPDATED ${dateLabel}`}
      />

      <div className="flex flex-col md:flex-row gap-10 md:gap-12 pt-12 md:pt-14">
        <div className="flex flex-col flex-1 min-w-0">
          <h1 className="font-serif-tc font-bold leading-[0.9] tracking-[-0.05em] text-foreground text-[64px] sm:text-[80px] md:text-[112px] lg:text-[128px]">
            Photos.
          </h1>
          <div className="flex items-baseline gap-3.5 mt-7 pt-5 border-t border-foreground max-w-[480px]">
            <span className="font-mono text-[11px] tracking-[0.16em] text-foreground shrink-0">FRAMES</span>
            <p className="font-serif-tc italic text-[14px] sm:text-[15px] text-foreground/70 leading-snug">
              street · travel · daily — {photoCount} photos / {albumCount} albums
            </p>
          </div>
        </div>

        {cover && (
          <aside className="flex flex-col w-full md:w-[280px] shrink-0">
            <div className="border-y border-foreground py-3 bg-background">
              <div className="relative w-full aspect-[3/2]">
                <Image
                  src={cover.src}
                  alt="Cover"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 280px"
                />
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-3 pt-2.5">
              <span className="font-mono text-[10px] tracking-[0.06em] text-foreground/65 truncate min-w-0 flex-1">{cover.meta.id}</span>
              <span className="font-mono text-[10px] tracking-[0.06em] text-foreground/65 truncate text-right shrink-0">{cover.meta.exif}</span>
            </div>
            <span className="font-mono text-[9px] tracking-[0.08em] text-foreground/45 pt-1">⟶ from the field, recently</span>
          </aside>
        )}
      </div>
    </Container>
  );
}
