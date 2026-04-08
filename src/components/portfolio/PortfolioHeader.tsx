interface PortfolioHeaderProps {
  photoCount: number;
  albumCount: number;
}

export default function PortfolioHeader({
  photoCount,
  albumCount,
}: PortfolioHeaderProps) {
  return (
    <header className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-20">
      <p className="text-xs text-muted-foreground font-medium tracking-[0.2em] uppercase mb-4">
        Photographer
      </p>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
        Photos
      </h1>
      <p className="text-sm text-muted-foreground mb-4">
        Street · Travel · Daily
      </p>
      <p className="text-xs text-muted-foreground font-light tabular-nums">
        {photoCount} photos · {albumCount} albums
      </p>
    </header>
  );
}
