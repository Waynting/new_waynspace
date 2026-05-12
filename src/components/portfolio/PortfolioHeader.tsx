import { Container } from '@/components/Container';
import type { Photo } from '@/types/photos';

interface PortfolioHeaderProps {
  photoCount: number;
  albumCount: number;
  coverPhoto?: Photo | null;
}

export default function PortfolioHeader({
  photoCount,
  albumCount,
}: PortfolioHeaderProps) {
  return (
    <Container className="pt-16 pb-10">
      <div className="tracking-[0.2em] uppercase text-xs font-medium text-muted-foreground mb-4">
        Photographer
      </div>
      <h1 className="text-[40px] sm:text-[48px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground">
        Photos
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Street · Travel · Daily
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70 tabular-nums">
        {photoCount} photos · {albumCount} albums
      </p>
    </Container>
  );
}
