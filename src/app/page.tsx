import Link from 'next/link';
import { generateStructuredData } from '@/lib/seo';
import { getAllPosts } from '@/lib/posts';
import { Container } from '@/components/Container';
import { MastheadStrip } from '@/components/MastheadStrip';
import { SectionDivider } from '@/components/SectionDivider';
import { NowStrip } from '@/components/NowStrip';
import GenerativePhoto from '@/components/GenerativePhotoLazy';
import { formatDateLabel } from '@/lib/format';

const socials = [
  { label: 'GitHub', href: 'https://github.com/Waynting' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/waiting5928/' },
  { label: 'Instagram', href: 'https://www.instagram.com/waiting_941208/' },
  { label: 'Medium', href: 'https://medium.com/@wliu5928' },
  { label: 'Email', href: 'mailto:wayntingliu@gmail.com' },
  { label: 'RSS', href: '/feed.xml' },
];

function formatMonthDay(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { mon: '--', day: '--' };
  return {
    mon: d.toLocaleString('en-US', { month: 'short' }),
    day: String(d.getDate()).padStart(2, '0'),
  };
}

export default async function Home() {
  const structuredData = generateStructuredData('person', {
    sameAs: ['https://github.com/Waynting', 'https://www.instagram.com/waiting_941208'],
    jobTitle: '台大資管學生',
    worksFor: { '@type': 'Organization', name: 'National Taiwan University' },
  });

  const allPosts = await getAllPosts();
  const latestPosts = allPosts.slice(0, 5);
  const totalPosts = allPosts.length;

  // Local portrait — same-origin avoids canvas-tainting CORS issues that
  // would silently break ASCII rendering on cross-origin (R2) sources.
  const featuredPhotoSrc = '/LIU_0457.jpg';
  const featuredPhotoMeta = { id: 'WTL · TAIPEI', exif: '35mm · f/2.8 · 1/250' };

  const issueLabel = `VOL. ${String(totalPosts >= 30 ? 2 : 1).padStart(2, '0')} / ISSUE ${String(latestPosts.length).padStart(2, '0')}`;
  const dateLabel = formatDateLabel();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* — MASTHEAD — */}
      <Container className="pt-20 pb-12">
        <MastheadStrip
          primary={issueLabel}
          secondary={`${dateLabel} — 第 二 期`}
          right="A PERSONAL PUBLICATION"
        />

        <div className="flex flex-col md:flex-row gap-12 pt-14">
          {/* — Name column — */}
          <div className="flex flex-col flex-1 min-w-0">
            <h1 className="font-serif-tc font-bold leading-[0.9] tracking-[-0.05em] text-foreground text-[88px] md:text-[128px] lg:text-[144px]">
              劉<br />威廷.
            </h1>
            <div className="flex items-baseline gap-3.5 mt-7 pt-5 border-t border-foreground max-w-[480px]">
              <span className="font-mono text-[11px] tracking-[0.16em] text-foreground shrink-0">EDITOR</span>
              <p className="font-serif-tc italic text-[15px] text-foreground/70 leading-snug">
                Wei-Ting Liu
              </p>
            </div>
          </div>

          {/* — Masthead block (right) — */}
          <aside className="flex flex-col w-full md:w-[280px] shrink-0">
            <div className="border-y border-foreground py-3 flex items-center justify-center bg-background">
              <GenerativePhoto src={featuredPhotoSrc} alt="Generative ASCII portrait" />
            </div>
            <div className="flex items-baseline justify-between pt-2.5">
              <span className="font-mono text-[10px] tracking-[0.06em] text-foreground/65">{featuredPhotoMeta.id}</span>
              <span className="font-mono text-[10px] tracking-[0.06em] text-foreground/65">{featuredPhotoMeta.exif}</span>
            </div>
            <span className="font-mono text-[9px] tracking-[0.08em] text-foreground/45 pt-1">⟶ rendered live · move cursor to perturb</span>

            <div className="flex flex-col gap-2 pt-7 mt-7 border-t border-border">
              <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-foreground">IN THIS ISSUE</span>
              <IssueIndexRow num="01" title="Editor's note" />
              <IssueIndexRow num="02" title="/Now — 五月在做的事" />
              <IssueIndexRow num="03" title="Latest five" />
            </div>

            <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 pt-6 mt-6 border-t border-border">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('mailto') || s.href.startsWith('/') ? undefined : '_blank'}
                  rel={s.href.startsWith('mailto') || s.href.startsWith('/') ? undefined : 'noopener noreferrer'}
                  className="font-sans text-[11px] text-foreground/65 border-b border-foreground/65 pb-px hover:text-foreground hover:border-foreground transition-colors"
                >
                  {s.label} ↗
                </a>
              ))}
            </div>
          </aside>
        </div>
      </Container>

      {/* — Bio (reading width) — */}
      <Container>
        <div className="max-w-[640px]">
          <span className="font-mono text-[11px] font-semibold tracking-[0.16em] text-foreground block mb-4">¶ EDITOR&apos;S NOTE</span>
          <p className="font-serif-tc text-[19px] leading-[1.7] text-foreground mb-4">
            第 02 期。台大資訊管理學系大二，雙主修創新領域學士學位學程。目前於 <span className="border-b-2 border-foreground font-medium">ABConvert</span> 擔任軟體工程實習生，以 Next.js + TypeScript 開發 A/B testing 產品。
          </p>
          <p className="font-serif-tc text-[19px] leading-[1.7] text-foreground/65">
            這個地方是我用來放雜湊心思、攝影、和當週讀過的東西的小型印刷品。每月一封信，剩下的時候就放在這裡讓人翻閱。
          </p>
        </div>
      </Container>

      {/* — Now — */}
      <Container className="mt-16">
        <NowStrip updatedAt={dateLabel} />
      </Container>

      {/* — Latest Articles — */}
      <Container className="mt-24">
        <SectionDivider
          title="Latest."
          tagline="— five most recent"
          right={
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="font-mono text-[11px] tracking-[0.12em] text-foreground/65 whitespace-nowrap">{latestPosts.length} / {totalPosts}</span>
              <Link
                href="/blog"
                className="font-sans text-xs text-foreground border-b border-foreground pb-px hover:opacity-70 transition-opacity whitespace-nowrap"
              >
                All Articles →
              </Link>
            </div>
          }
        />

        <div className="flex flex-col max-w-[760px]">
          {latestPosts.map((post, i) => {
            const { mon, day } = formatMonthDay(post.date);
            const num = totalPosts - i;
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={`row-link items-start gap-7 py-5 ${i < latestPosts.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="flex flex-col shrink-0 w-16 pt-1">
                  <span className="font-mono text-[11px] tracking-[0.06em] text-foreground/65">{mon} {day}</span>
                  <span className="font-mono text-[9px] tracking-[0.08em] text-foreground/45 mt-0.5">№ {String(num).padStart(3, '0')}</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0 gap-1.5">
                  <div className="flex items-baseline gap-2">
                    {i === 0 && (
                      <span className="font-mono text-[9px] font-bold tracking-[0.12em] text-white bg-foreground px-1.5 py-0.5">
                        NEW
                      </span>
                    )}
                    <h3 className="row-title font-serif-tc font-bold text-[22px] leading-[1.25] tracking-[-0.02em] text-foreground">
                      {post.title}
                      <span className="row-arrow font-sans text-foreground/60">→</span>
                    </h3>
                  </div>
                  {post.excerpt && (
                    <p className="font-sans text-[13px] text-foreground/60 leading-relaxed line-clamp-1">
                      {post.excerpt}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end shrink-0 w-20 pt-1.5 gap-1">
                  <span className="font-mono text-[10px] tracking-[0.12em] text-foreground">{post.category}</span>
                  <span className="font-mono text-[10px] text-foreground/45">{post.readTime}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>

    </>
  );
}

function IssueIndexRow({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-[10px] text-foreground/65 w-7 shrink-0">p.{num}</span>
      <span className="font-serif-tc text-[13px] text-foreground leading-snug">{title}</span>
    </div>
  );
}
