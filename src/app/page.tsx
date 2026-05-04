import Link from 'next/link';
import { generateStructuredData } from '@/lib/seo';
import { getAllPosts } from '@/lib/posts';
import { getPortfolioIndex } from '@/lib/portfolio';
import EmailSubscribe from '@/components/EmailSubscribe';
import { Container } from '@/components/Container';
import { NowStrip } from '@/components/NowStrip';
import GenerativePhoto from '@/components/GenerativePhotoLazy';

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

  // Pick a photo for the generative slot — rotate daily across recent/featured photos
  let featuredPhotoSrc = '/LIU_0457.jpg';
  let featuredPhotoMeta = { id: 'LIU_0457.jpg', exif: '35mm · f/2.8 · 1/250' };
  try {
    const { photos } = await getPortfolioIndex();
    // Pool: featured photos if any, otherwise the 12 most recent by dateTaken
    const featuredPool = photos.filter((p) => p.featured);
    const pool =
      featuredPool.length > 0
        ? featuredPool
        : [...photos]
            .sort(
              (a, b) =>
                new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime()
            )
            .slice(0, 12);
    if (pool.length > 0) {
      // Day-of-year rotation so the photo changes daily but is deterministic per day
      const now = new Date();
      const dayOfYear = Math.floor(
        (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
      );
      const pick = pool[dayOfYear % pool.length];
      featuredPhotoSrc = pick.urls.thumb;
      const e = pick.exif;
      const exifBits = [e?.focalLength, e?.aperture, e?.shutterSpeed].filter(Boolean);
      const exifStr = exifBits.join(' · ');
      const taken = pick.dateTaken
        ? new Date(pick.dateTaken).toISOString().slice(0, 10).replace(/-/g, '.')
        : null;
      const locationOrDate = pick.location?.name || taken || pick.id;
      featuredPhotoMeta = {
        id: locationOrDate,
        exif: exifStr || (taken ?? '—'),
      };
    }
  } catch {
    // R2 unavailable — fall back to local portrait
  }

  const issueLabel = `VOL. ${String(totalPosts >= 30 ? 2 : 1).padStart(2, '0')} / ISSUE ${String(latestPosts.length).padStart(2, '0')}`;
  const today = new Date();
  const dateLabel = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* — MASTHEAD — */}
      <Container className="pt-20 pb-12">
        <div className="flex items-center justify-between pb-4 border-b border-foreground">
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-[11px] font-semibold tracking-[0.16em] text-foreground">{issueLabel}</span>
            <span className="font-mono text-[11px] tracking-[0.16em] text-foreground/55">{dateLabel} — 第 二 期</span>
          </div>
          <span className="font-mono text-[11px] tracking-[0.16em] text-foreground/55 hidden sm:inline">A PERSONAL PUBLICATION</span>
        </div>

        <div className="flex flex-col md:flex-row gap-12 pt-14">
          {/* — Name column — */}
          <div className="flex flex-col flex-1 min-w-0">
            <h1 className="font-serif-tc font-bold leading-[0.9] tracking-[-0.05em] text-foreground text-[88px] md:text-[128px] lg:text-[144px]">
              劉<br />威廷.
            </h1>
            <div className="flex items-baseline gap-3.5 mt-7 pt-5 border-t border-foreground max-w-[480px]">
              <span className="font-mono text-[11px] tracking-[0.16em] text-foreground shrink-0">EDITOR</span>
              <p className="font-serif-tc italic text-[15px] text-foreground/70 leading-snug">
                Wei-Ting Liu — 寫字、寫程式、寫光線。
              </p>
            </div>
          </div>

          {/* — Masthead block (right) — */}
          <aside className="flex flex-col w-full md:w-[280px] shrink-0">
            <div className="border-y border-foreground py-3 flex items-center justify-center bg-white">
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
              <IssueIndexRow num="04" title="Subscribe" />
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
        <div className="flex items-end justify-between pb-3 border-b-2 border-foreground">
          <div className="flex items-baseline gap-4">
            <h2 className="font-serif-tc font-bold leading-none tracking-[-0.04em] text-foreground text-5xl md:text-[56px]">
              Latest.
            </h2>
            <span className="font-serif-tc italic text-sm text-foreground/60">— five most recent</span>
          </div>
          <div className="flex items-center gap-4 pb-3">
            <span className="font-mono text-[11px] tracking-[0.12em] text-foreground/65">{latestPosts.length} / {totalPosts}</span>
            <Link
              href="/blog"
              className="font-sans text-xs text-foreground border-b border-foreground pb-px hover:opacity-70 transition-opacity"
            >
              All Articles →
            </Link>
          </div>
        </div>

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

      {/* — Newsletter — */}
      <Container className="mt-24">
        <section className="bg-foreground text-white p-12 md:p-14 flex flex-col md:flex-row gap-12">
          <div className="flex flex-col flex-1">
            <div className="flex items-baseline gap-3.5 mb-4">
              <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-white">SUBSCRIBE</span>
              <span className="font-mono text-[11px] tracking-[0.12em] text-white/50">月刊一封</span>
            </div>
            <h3 className="font-serif-tc font-bold text-[36px] md:text-[44px] leading-[1.1] tracking-[-0.03em] text-white mb-4">
              寫了就寄給你.
            </h3>
            <p className="font-sans text-sm text-white/65 leading-relaxed max-w-[460px]">
              每月一封，整理當月的文章與正在做的事。不發廢話，沒興趣可以隨時退訂。
            </p>
          </div>
          <div className="flex flex-col w-full md:w-[320px] shrink-0 gap-3">
            <EmailSubscribe />
            <span className="font-mono text-[10px] tracking-[0.08em] text-white/40 mt-1">
              powered by Buttondown
            </span>
          </div>
        </section>
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
