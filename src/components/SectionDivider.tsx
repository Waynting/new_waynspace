import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionDividerProps {
  title: string;
  tagline?: string;
  right?: ReactNode;
  titleClassName?: string;
}

const DEFAULT_TITLE_CLASS =
  'font-serif-tc font-bold leading-none tracking-[-0.04em] text-foreground text-[34px] sm:text-5xl md:text-[56px]';

export function SectionDivider({
  title,
  tagline,
  right,
  titleClassName,
}: SectionDividerProps) {
  return (
    <div className="flex items-end justify-between gap-3 sm:gap-4 pb-3 border-b-2 border-foreground">
      <div className="flex items-baseline gap-3 sm:gap-4 min-w-0">
        <h2 className={cn(DEFAULT_TITLE_CLASS, titleClassName)}>{title}</h2>
        {tagline && (
          <span className="font-serif-tc italic text-sm text-foreground/60 hidden sm:inline truncate">
            {tagline}
          </span>
        )}
      </div>
      {right && <div className="shrink-0 pb-1">{right}</div>}
    </div>
  );
}
