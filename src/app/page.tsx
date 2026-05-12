import Link from 'next/link';
import Image from 'next/image';
import { generateStructuredData } from '@/lib/seo';
import { getAllPosts } from '@/lib/posts';
import { Container } from '@/components/Container';

const socials: { label: string; href: string; icon: 'github' | 'linkedin' | 'instagram' | 'medium' | 'email' | 'rss' }[] = [
  { label: 'GitHub', href: 'https://github.com/Waynting', icon: 'github' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/waiting5928/', icon: 'linkedin' },
  { label: 'Instagram', href: 'https://www.instagram.com/waiting_941208/', icon: 'instagram' },
  { label: 'Medium', href: 'https://medium.com/@wliu5928', icon: 'medium' },
  { label: 'Email', href: 'mailto:wayntingliu@gmail.com', icon: 'email' },
  { label: 'RSS', href: '/feed.xml', icon: 'rss' },
];

function formatMonthDay(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '--/--';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}`;
}

function SocialIcon({ icon }: { icon: 'github' | 'linkedin' | 'instagram' | 'medium' | 'email' | 'rss' }) {
  const props = { width: 16, height: 16, viewBox: '0 0 24 24', className: 'shrink-0' };
  switch (icon) {
    case 'github':
      return (
        <svg {...props} fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg {...props} fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg {...props} fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.79-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'medium':
      return (
        <svg {...props} fill="currentColor">
          <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42zM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
        </svg>
      );
    case 'email':
      return (
        <svg {...props} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'rss':
      return (
        <svg {...props} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.503 20.752A2.25 2.25 0 014.252 18.5a2.25 2.25 0 012.251-2.252 2.25 2.25 0 012.252 2.252 2.25 2.25 0 01-2.252 2.252zM4 11.5a8.5 8.5 0 018.5 8.5M4 4.5a15.5 15.5 0 0115.5 15.5" />
        </svg>
      );
  }
}

export default async function Home() {
  const structuredData = generateStructuredData('person', {
    sameAs: ['https://github.com/Waynting', 'https://www.instagram.com/waiting_941208'],
    jobTitle: '台大資管學生',
    worksFor: { '@type': 'Organization', name: 'National Taiwan University' },
  });

  const allPosts = await getAllPosts();
  const latestPosts = allPosts.slice(0, 5);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Intro */}
      <Container className="pt-16 pb-12">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div className="flex flex-col flex-1 min-w-0">
            <div className="tracking-[0.2em] uppercase text-xs font-medium text-muted-foreground mb-4">
              waynspace.com
            </div>
            <h1 className="text-[40px] sm:text-[48px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground">
              劉威廷
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              台大資管 × 創新領域學士學位學程
            </p>
          </div>
          <div className="hidden sm:block relative w-[120px] h-[120px] shrink-0 overflow-hidden rounded-md bg-muted border border-border">
            <Image
              src="/LIU_0457.jpg"
              alt="Wei-Ting Liu"
              fill
              sizes="120px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <p className="max-w-[560px] text-sm leading-[1.85] text-muted-foreground">
          台大資訊管理學系大二，雙主修創新領域學士學位學程。目前於{' '}
          <a
            href="https://www.abconvert.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground border-b border-foreground/40 hover:border-foreground transition-colors"
          >
            ABConvert
          </a>{' '}
          擔任軟體工程實習生，以 Next.js + TypeScript 開發 A/B testing 產品。關注網頁前端工程、數據驅動的產品開發，以及攝影與寫作。
        </p>

        <div className="flex items-center mt-5 gap-5 flex-wrap">
          <a
            href="https://waynting.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            英文履歷 ↗
          </a>
          <span className="text-xs text-border" aria-hidden>·</span>
          <div className="flex items-center gap-4 text-muted-foreground">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('mailto') || s.href.startsWith('/') ? undefined : '_blank'}
                rel={s.href.startsWith('mailto') || s.href.startsWith('/') ? undefined : 'noopener noreferrer'}
                aria-label={s.label}
                className="hover:text-foreground transition-colors"
              >
                <SocialIcon icon={s.icon} />
              </a>
            ))}
          </div>
        </div>
      </Container>

      {/* Latest Articles */}
      <Container className="mt-4 pb-20">
        <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-border">
          <span className="tracking-[0.18em] uppercase text-xs font-semibold text-muted-foreground">
            Latest Articles
          </span>
          <Link
            href="/blog"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            All Articles →
          </Link>
        </div>

        <div className="flex flex-col">
          {latestPosts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={`row-link items-start py-4 px-3 gap-5 ${i < latestPosts.length - 1 ? 'border-b border-border/60' : ''}`}
            >
              <div className="shrink-0 w-10 pt-0.5 tabular-nums">
                <span className="text-xs font-light text-muted-foreground">
                  {formatMonthDay(post.date)}
                </span>
              </div>
              <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                <h3 className="row-title text-[14px] leading-[1.4] font-medium text-foreground/90">
                  {post.title}
                  <span className="row-arrow text-foreground/50">→</span>
                </h3>
                {post.excerpt && (
                  <p className="text-[12px] leading-[1.5] text-muted-foreground line-clamp-1">
                    {post.excerpt}
                  </p>
                )}
              </div>
              <div className="shrink-0 w-24 pt-0.5">
                <span className="text-[12px] text-right text-muted-foreground/70 font-light block">
                  {post.category}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
