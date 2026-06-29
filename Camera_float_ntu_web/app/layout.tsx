import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { MobileNav } from "@/components/MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Analytics } from "@/components/Analytics";
import { ImagePrefetcher } from "@/components/ImagePrefetcher";

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://camera-float-ntu-web.waynspace.com';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: {
    default: "相機漂流計劃 台大Ver.",
    template: "%s | 相機漂流計劃 台大Ver.",
  },
  description: "相機共享計劃，記錄校園生活的美好瞬間。由台大資管二劉威廷發起，讓台大學生輪流使用相機記錄生活。",
  keywords: ["相機漂流", "台大", "攝影", "相機共享", "校園生活", "NTU", "相機漂流計劃"],
  authors: [{ name: "劉威廷", url: "https://www.waynspace.com/" }],
  creator: "劉威廷",
  publisher: "Waynspace",
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: `${baseUrl}${basePath}`,
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: `${baseUrl}${basePath}`,
    siteName: "相機漂流計劃 台大Ver.",
    title: "相機漂流計劃 台大Ver.",
    description: "相機共享計劃，記錄校園生活的美好瞬間。由台大資管二劉威廷發起，讓台大學生輪流使用相機記錄生活。",
    images: [
      {
        url: `${baseUrl}${basePath}/blog-image.jpg`,
        width: 1200,
        height: 1200,
        alt: "相機漂流計劃 台大Ver.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "相機漂流計劃 台大Ver.",
    description: "相機共享計劃，記錄校園生活的美好瞬間。",
    images: [`${baseUrl}${basePath}/blog-image.jpg`],
    creator: "@waiting_941208",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // 如果需要 Google Search Console 验证，可以添加
    // google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <link rel="icon" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/waynspace-logo.svg`} type="image/svg+xml" />
        {/* Google Analytics 4 - 在 head 中初始化以确保更早加载 */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                    send_page_view: true
                  });
                `,
              }}
            />
          </>
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var initialTheme = theme || systemTheme;
                  if (initialTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={notoSansTC.className}>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 bg-background border-b">
            <nav className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-3">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 hover:opacity-60 transition-opacity">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/waynspace-logo.svg`}
                    alt="Waynspace"
                    width={16}
                    height={16}
                    className="w-4 h-4 dark:invert"
                    style={{ display: 'block' }}
                  />
                  <span className="text-sm tracking-[0.15em] uppercase font-medium">相機漂流計劃 台大Ver.</span>
                </Link>
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                  <Link
                    href="https://www.waynspace.com/"
                    className="text-xs tracking-[0.1em] uppercase hover:opacity-60 transition-opacity"
                  >
                    主網站
                  </Link>
                  <Link
                    href="/about"
                    className="text-xs tracking-[0.1em] uppercase hover:opacity-60 transition-opacity"
                  >
                    關於
                  </Link>
                  <ThemeToggle />
                </div>
                {/* Mobile Navigation */}
                <div className="flex items-center gap-2 md:hidden">
                  <ThemeToggle />
                  <MobileNav />
                </div>
              </div>
            </nav>
          </header>
          <main className="flex-1">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
          <Analytics />
          <ImagePrefetcher />
          <footer className="border-t mt-auto py-8">
            <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs tracking-[0.1em] uppercase text-muted-foreground">
                <p>© {new Date().getFullYear()} 相機漂流計劃 台大Ver.</p>
                <div className="flex items-center gap-4">
                  <Link href="/about" className="hover:opacity-60 transition-opacity">關於</Link>
                  <span>·</span>
                  <Link href="https://www.waynspace.com/" className="hover:opacity-60 transition-opacity">Waynspace</Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

