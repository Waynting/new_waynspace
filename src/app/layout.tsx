import type { Metadata } from 'next';
import { Noto_Sans_TC, Noto_Serif_TC, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/back-to-top';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Analytics } from '@/components/Analytics';
import { ServiceWorkerCleanup } from '@/components/ServiceWorkerCleanup';
import { SmoothScroll } from '@/components/SmoothScroll';
import { defaultMetadata } from '@/config/seo';

const notoSansTC = Noto_Sans_TC({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-tc',
  preload: false,
});

const notoSerifTC = Noto_Serif_TC({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-serif-tc',
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
  preload: false,
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" className={`${notoSansTC.variable} ${notoSerifTC.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {/* Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />
        {/* RSS / Atom auto-discovery */}
        <link rel="alternate" type="application/rss+xml" title="Waynspace RSS Feed" href="/feed.xml" />
        <link rel="alternate" type="application/atom+xml" title="Waynspace Atom Feed" href="/atom.xml" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <SmoothScroll />
          <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="relative flex-grow">
              {children}
            </main>
            <Footer />
            <BackToTop />
          </div>
        </ThemeProvider>
        <Analytics />
        <ServiceWorkerCleanup />
      </body>
    </html>
  );
}
