'use client';

import Link from 'next/link';
import Image from 'next/image';
import { navigationConfig } from '@/config/navigation';
import Navigation from './Navigation';

export default function Header() {
  return (
    <header className="sticky top-0 z-[1000] border-b border-border bg-background/95 backdrop-blur-md">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-14">
          {/* Logo — favicon + text */}
          <Link
            href={navigationConfig.pages.home}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors tracking-tight"
          >
            <Image
              src="/blog-image.jpg"
              alt="Waynspace"
              width={20}
              height={20}
              className="rounded-sm"
            />
            Waynspace
          </Link>

          {/* Navigation */}
          <Navigation />
        </div>
      </div>
    </header>
  );
}
