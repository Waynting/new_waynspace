import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ContainerProps = {
  variant?: 'display' | 'reading';
  className?: string;
  children: ReactNode;
};

export function Container({ variant = 'display', className, children }: ContainerProps) {
  return (
    <div
      className={cn(
        variant === 'display' ? 'container-display' : 'container-reading',
        className
      )}
    >
      {children}
    </div>
  );
}
