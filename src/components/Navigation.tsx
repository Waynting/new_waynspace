'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { navigationConfig } from '@/config/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mobile menu: slide down from nav, slide up when closing
  useEffect(() => {
    if (isMenuOpen && !isMenuClosing) {
      setIsPanelVisible(false);
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsPanelVisible(true));
      });
      return () => cancelAnimationFrame(t);
    }
  }, [isMenuOpen, isMenuClosing]);

  const closeMobileMenu = () => {
    if (isMenuClosing) return;
    setIsMenuClosing(true);
    setIsPanelVisible(false);
    menuCloseTimeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
      setIsMenuClosing(false);
      if (menuCloseTimeoutRef.current) {
        clearTimeout(menuCloseTimeoutRef.current);
        menuCloseTimeoutRef.current = null;
      }
    }, 280);
  };

  useEffect(() => {
    return () => {
      if (menuCloseTimeoutRef.current) {
        clearTimeout(menuCloseTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = null;
        }
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const enhancedNavigation = navigationConfig.main;

  return (
    <nav className="relative flex items-center z-[100]" ref={dropdownRef}>
      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
        {enhancedNavigation.map((item) => (
          <div key={item.name} className="relative">
            {item.children && item.children.length > 0 ? (
              <div 
                className="relative group"
                onMouseEnter={() => {
                  if (closeTimeoutRef.current) {
                    clearTimeout(closeTimeoutRef.current);
                    closeTimeoutRef.current = null;
                  }
                  setOpenDropdown(item.name);
                }}
                onMouseLeave={() => {
                  closeTimeoutRef.current = setTimeout(() => {
                    setOpenDropdown(null);
                  }, 300);
                }}
              >
                <button
                  onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                  className={cn(
                    "px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap border",
                    isActive(item.href) 
                      ? "bg-foreground text-background font-semibold shadow-md border-foreground"
                      : "border-border hover:bg-muted hover:border-foreground/50 hover:shadow-lg transform hover:scale-105"
                  )}
                >
                  <span className="flex items-center gap-1 xl:gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                    <svg 
                      className={`w-3 h-3 xl:w-4 xl:h-4 transition-transform duration-200 ${
                        openDropdown === item.name ? 'rotate-180' : ''
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                {openDropdown === item.name && (
                  <div 
                    className="absolute z-[99999] mt-2 w-48 rounded-md shadow-xl bg-background border border-border"
                  >
                    {item.children.map((child, index) => (
                      child.name === '───' ? (
                        <div key={`separator-${item.name}-${index}`} className="border-t my-2 border-border" />
                      ) : (
                        <Link
                          key={`desktop-${item.name}-${index}-${child.href}`}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center justify-between transition-all duration-300"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{child.icon}</span>
                            {child.name}
                          </div>
                          {child.badge && (
                            <span className="px-2 py-1 text-xs rounded-full bg-primary text-primary-foreground">
                              {child.badge}
                            </span>
                          )}
                        </Link>
                      )
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "px-4 xl:px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap block border",
                  isActive(item.href) 
                    ? "bg-foreground text-background font-semibold shadow-md border-foreground"
                    : "text-foreground border-border hover:bg-muted hover:border-foreground/50 hover:shadow-lg"
                )}
              >
                <span className="flex items-center gap-2 justify-center">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </span>
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Theme Toggle and Mobile Navigation */}
      <div className="flex items-center gap-2 ml-4">
        <ThemeToggle />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => (isMenuOpen ? closeMobileMenu() : setIsMenuOpen(true))}
          className="lg:hidden"
          aria-expanded={isMenuOpen}
        >
          <span className="sr-only">開啟選單</span>
          {isMenuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </Button>
      </div>

      {/* Mobile Navigation Menu - drops down from below nav */}
      {mounted && (isMenuOpen || isMenuClosing) && createPortal(
        <>
          {/* 深色背景：從 nav 下方蓋過整頁內容 */}
          <div
            className={cn(
              'lg:hidden fixed top-20 left-0 right-0 bottom-0 z-[9998] bg-black/80 dark:bg-black/90',
              'transition-opacity duration-300 ease-out',
              isPanelVisible && !isMenuClosing ? 'opacity-100' : 'opacity-0'
            )}
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          <div
            className={cn(
              'lg:hidden fixed top-20 left-0 right-0 z-[9999] bg-background border-b border-border shadow-lg',
              'max-h-[calc(100vh-5rem)] overflow-y-auto',
              'transition-transform duration-300 ease-out will-change-transform',
              isPanelVisible && !isMenuClosing ? 'translate-y-0' : '-translate-y-full'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="導覽選單"
          >
            <div className="px-4 py-4 space-y-1">
              {enhancedNavigation.map((item) => (
                <div key={item.name} className="mb-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (!item.children || item.children.length === 0) {
                          closeMobileMenu();
                        }
                      }}
                      className={cn(
                        "flex-1 px-1.5 py-3 rounded-lg text-base font-medium transition-all duration-200",
                        isActive(item.href) 
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.name}</span>
                      </span>
                    </Link>
                    
                    {item.children && item.children.length > 0 && (
                      <button
                        onClick={() => setMobileOpenDropdown(mobileOpenDropdown === item.name ? null : item.name)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <svg 
                          className={`w-4 h-4 transition-transform duration-200 ${
                            mobileOpenDropdown === item.name ? 'rotate-180' : ''
                          }`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {item.children && item.children.length > 0 && mobileOpenDropdown === item.name && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child, index) => (
                        child.name === '───' ? (
                          <div key={`mobile-separator-${item.name}-${index}`} className="border-t my-1 border-border/30" />
                        ) : (
                          <Link
                            key={`mobile-${item.name}-${index}-${child.href}`}
                            href={child.href}
                            onClick={closeMobileMenu}
                            className="block px-1.5 py-2 text-sm transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-foreground hover:text-foreground"
                          >
                            <span className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{child.icon}</span>
                                <span>{child.name}</span>
                              </div>
                              {child.badge && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                                  {child.badge}
                                </span>
                              )}
                            </span>
                          </Link>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </nav>
  );
}

