interface MastheadStripProps {
  primary: string;
  secondary?: string;
  right?: string;
}

export function MastheadStrip({ primary, secondary, right }: MastheadStripProps) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-foreground gap-4 flex-wrap">
      <div className="flex items-baseline gap-3 sm:gap-4 flex-wrap min-w-0">
        <span className="font-mono text-[11px] font-semibold tracking-[0.16em] text-foreground whitespace-nowrap">
          {primary}
        </span>
        {secondary && (
          <span className="font-mono text-[11px] tracking-[0.16em] text-foreground/55 whitespace-nowrap">
            {secondary}
          </span>
        )}
      </div>
      {right && (
        <span className="font-mono text-[11px] tracking-[0.16em] text-foreground/55 hidden sm:inline whitespace-nowrap">
          {right}
        </span>
      )}
    </div>
  );
}
