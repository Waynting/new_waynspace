'use client';

import Link from 'next/link';
import Image from 'next/image';
import { navigationConfig } from '@/config/navigation';
import Navigation from './Navigation';

export default function Header() {
  return (
    <header className="sticky top-0 z-[1000] border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container-display">
        <div className="flex items-center justify-between h-14">
          {/* Logo — favicon + text */}
          <Link
            href={navigationConfig.pages.home}
            className="flex items-center gap-2.5 text-sm font-medium text-foreground hover:opacity-60 transition-opacity"
          >
            <Image
              src="/blog-image.jpg"
              alt="Waynspace"
              width={20}
              height={20}
              className="rounded-none"
            />
            <span className="tracking-[0.15em] uppercase">Waynspace</span>
          </Link>

          {/* Navigation */}
          <Navigation />
        </div>
      </div>
    </header>
  );
}
