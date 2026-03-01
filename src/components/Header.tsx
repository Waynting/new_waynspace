'use client';

import Link from 'next/link';
import { navigationConfig } from '@/config/navigation';
import Navigation from './Navigation';

export default function Header() {
  return (
    <header className="sticky top-0 z-[1000] border-b border-border bg-background/95 backdrop-blur-md">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-14">
          {/* Logo — plain text, no image */}
          <Link
            href={navigationConfig.pages.home}
            className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors tracking-tight"
          >
            Waynspace
          </Link>

          {/* Navigation */}
          <Navigation />
        </div>
      </div>
    </header>
  );
}
