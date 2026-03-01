'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { navigationConfig } from '@/config/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Animate panel in after open
  useEffect(() => {
    if (isOpen && !closing) {
      const t = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      return () => cancelAnimationFrame(t);
    }
  }, [isOpen, closing]);

  const close = () => {
    if (closing) return;
    setClosing(true);
    setVisible(false);
    closeTimer.current = setTimeout(() => {
      setIsOpen(false);
      setClosing(false);
    }, 260);
  };

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const nav = navigationConfig.main;

  return (
    <nav className="flex items-center gap-1">
      {/* Desktop links */}
      <div className="hidden sm:flex items-center gap-5">
        {nav.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm transition-colors pb-0.5',
              isActive(item.href)
                ? 'text-foreground font-medium border-b border-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* Theme toggle + hamburger */}
      <div className="flex items-center gap-2 ml-3">
        <ThemeToggle />
        <button
          className="sm:hidden p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => isOpen ? close() : setIsOpen(true)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu — portaled */}
      {mounted && (isOpen || closing) && createPortal(
        <>
          {/* Backdrop */}
          <div
            className={cn(
              'sm:hidden fixed inset-0 top-14 z-[9998] bg-background/80 backdrop-blur-sm transition-opacity duration-260',
              visible && !closing ? 'opacity-100' : 'opacity-0'
            )}
            onClick={close}
            aria-hidden
          />
          {/* Panel */}
          <div
            className={cn(
              'sm:hidden fixed top-14 left-0 right-0 z-[9999] bg-background border-b border-border',
              'transition-transform duration-260 ease-out will-change-transform',
              visible && !closing ? 'translate-y-0' : '-translate-y-2 opacity-0'
            )}
            role="dialog"
            aria-label="Navigation menu"
          >
            <div className="max-w-3xl mx-auto px-6 py-4 space-y-1">
              {nav.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className={cn(
                    'block py-2.5 text-sm transition-colors border-b border-border/40 last:border-0',
                    isActive(item.href)
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </nav>
  );
}
