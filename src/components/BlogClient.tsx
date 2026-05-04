'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Post, Category } from '@/types/blog';
import { trackCategoryFilter } from '@/lib/analytics';
import { Container } from '@/components/Container';
import { MastheadStrip } from '@/components/MastheadStrip';
import { SectionDivider } from '@/components/SectionDivider';
import { formatDateLabel } from '@/lib/format';

interface BlogClientProps {
  posts: Post[];
  categories: (Category & { count: number })[];
}

function formatMonthDay(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { mon: '--', day: '--' };
  return {
    mon: d.toLocaleString('en-US', { month: 'short' }),
    day: String(d.getDate()).padStart(2, '0'),
  };
}

function getYear(dateStr: string): number {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 0 : d.getFullYear();
}

export default function BlogClient({ posts, categories }: BlogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    let filtered = posts;
    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat) filtered = filtered.filter((p) => p.category === cat.name);
    }
    return [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [posts, selectedCategory, categories]);

  const total = posts.length;
  const featured = filteredPosts[0];
  const editorPicks = filteredPosts.slice(1, 5);

  // Group remaining (everything from index 1 onward) by year
  const byYear = useMemo(() => {
    const map = new Map<number, Post[]>();
    for (const post of filteredPosts) {
      const yr = getYear(post.date);
      if (!map.has(yr)) map.set(yr, []);
      map.get(yr)!.push(post);
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [filteredPosts]);

  const dateLabel = formatDateLabel();

  return (
    <>
      {/* — Page Masthead — */}
      <Container className="pt-20 pb-10">
        <MastheadStrip
          primary="SECTION 03 / THE ARCHIVE"
          secondary="文章彙整"
          right={`UPDATED ${dateLabel}`}
        />
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between pt-10 gap-4 sm:gap-6">
          <h1 className="font-serif-tc font-bold leading-[0.9] tracking-[-0.05em] text-foreground text-[64px] sm:text-[80px] md:text-[112px] lg:text-[128px]">
            Articles.
          </h1>
          <div className="flex flex-col items-start sm:items-end gap-1.5 sm:pb-4">
            <span className="font-serif-tc italic text-sm text-foreground/60">collected since</span>
            <span className="font-serif-tc font-bold text-2xl md:text-[28px] tracking-[-0.02em] text-foreground tabular-nums">
              {filteredPosts.length} 篇 / 2019
            </span>
          </div>
        </div>
      </Container>

      {/* — This Issue — */}
      {featured && (
        <Container className="mt-4">
          <div className="flex items-baseline gap-3.5 mb-6">
            <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-foreground">¶ THIS ISSUE</span>
            <span className="font-serif-tc italic text-sm text-foreground/60">— 本期推薦</span>
          </div>
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <article className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-[9px] font-bold tracking-[0.12em] text-white bg-foreground px-1.5 py-0.5">
                  FEATURE
                </span>
                <span className="font-mono text-[11px] tracking-[0.06em] text-foreground/60">
                  № {String(total).padStart(3, '0')} · {formatMonthDay(featured.date).mon} {formatMonthDay(featured.date).day} · {featured.readTime}
                </span>
              </div>
              <Link href={`/blog/${featured.slug}`} className="row-link flex-col group">
                <h3 className="row-title font-serif-tc font-bold text-3xl md:text-[36px] leading-[1.15] tracking-[-0.025em] text-foreground mb-3">
                  {featured.title}
                </h3>
                {featured.excerpt && (
                  <p className="font-serif-tc text-base leading-relaxed text-foreground/75">
                    {featured.excerpt}
                  </p>
                )}
              </Link>
              <div className="flex items-center gap-3.5 mt-4 pt-4 border-t border-border">
                <span className="font-mono text-[10px] tracking-[0.16em] text-foreground">FILED IN</span>
                <span className="font-sans text-xs text-foreground">{featured.category}</span>
                {featured.tags?.slice(0, 2).map((tag) => (
                  <span key={tag} className="font-sans text-xs text-foreground/55">#{tag}</span>
                ))}
              </div>
            </article>

            <aside className="flex flex-col w-full md:w-[280px] shrink-0 p-6 bg-muted border-t-4 border-foreground">
              <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-foreground mb-5">EDITOR&apos;S PICK</span>
              <div className="flex flex-col gap-4">
                {editorPicks.map((p, idx) => {
                  const md = formatMonthDay(p.date);
                  const num = total - 1 - idx;
                  return (
                    <Link
                      key={p.slug}
                      href={`/blog/${p.slug}`}
                      className={`row-link flex-col gap-1 ${idx < editorPicks.length - 1 ? 'pb-3.5 border-b border-foreground/15' : ''}`}
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-[9px] tracking-[0.08em] text-foreground/65">№ {String(num).padStart(3, '0')}</span>
                        <span className="font-mono text-[9px] text-foreground/50">{md.mon} {md.day}</span>
                      </div>
                      <h4 className="row-title font-serif-tc font-bold text-[15px] leading-[1.3] text-foreground">
                        {p.title}
                      </h4>
                    </Link>
                  );
                })}
              </div>
            </aside>
          </div>
        </Container>
      )}

      {/* — Filter Strip — */}
      <Container className="mt-20">
        <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground">
          <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-foreground shrink-0">¶ FILTER</span>
          <div className="flex flex-1 flex-wrap items-baseline gap-x-5 gap-y-2.5">
            <button
              onClick={() => {
                setSelectedCategory(null);
                trackCategoryFilter('All');
              }}
              className={`font-serif-tc text-base transition-all pb-1 ${
                selectedCategory === null
                  ? 'font-bold text-foreground border-b-2 border-foreground'
                  : 'text-foreground/65 hover:text-foreground'
              }`}
            >
              All <span className="font-mono text-[10px] ml-0.5 text-foreground/55">{posts.length}</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  trackCategoryFilter(cat.name);
                }}
                className={`font-serif-tc text-base transition-all pb-1 ${
                  selectedCategory === cat.slug
                    ? 'font-bold text-foreground border-b-2 border-foreground'
                    : 'text-foreground/65 hover:text-foreground'
                }`}
              >
                {cat.name} <span className="font-mono text-[10px] ml-0.5 text-foreground/55">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>
      </Container>

      {/* — Year Archives — */}
      {byYear.length === 0 ? (
        <Container className="mt-16">
          <p className="font-serif-tc italic text-foreground/60 py-12 text-center">暫無文章</p>
        </Container>
      ) : (
        byYear.map(([year, yearPosts], yIdx) => {
          const olderTotal = byYear.slice(yIdx + 1).reduce((sum, [, ps]) => sum + ps.length, 0);
          return (
          <Container key={year} className="mt-14">
            <SectionDivider
              title={String(year)}
              tagline={year === new Date().getFullYear() ? '— in progress.' : '— archive.'}
              titleClassName="font-serif-tc font-bold leading-none tracking-[-0.05em] text-foreground text-[48px] sm:text-[64px] md:text-[80px]"
              right={
                <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-foreground/65 whitespace-nowrap">
                  {yearPosts.length} ENTRIES
                </span>
              }
            />
            <div className="mb-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 pt-4">
              {yearPosts.map((p, i) => {
                const { mon, day } = formatMonthDay(p.date);
                const isLastInColumn =
                  i >= yearPosts.length - 2 ||
                  (yearPosts.length % 2 === 1 && i === yearPosts.length - 1);
                return (
                  <Link
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    className={`row-link flex-col gap-1.5 py-4 ${
                      isLastInColumn ? '' : 'border-b border-border'
                    }`}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[10px] tracking-[0.06em] text-foreground/65">
                        № {String(yearPosts.length - i + olderTotal).padStart(3, '0')}
                      </span>
                      <span className="font-mono text-[10px] text-foreground/45">{mon} {day}</span>
                    </div>
                    <h3 className="row-title font-serif-tc font-bold text-[19px] leading-[1.3] tracking-[-0.015em] text-foreground">
                      {p.title}
                    </h3>
                    {p.excerpt && (
                      <p className="font-sans text-xs text-foreground/60 leading-relaxed line-clamp-1">
                        {p.excerpt}
                      </p>
                    )}
                    <div className="flex items-baseline justify-between pt-1.5">
                      <span className="font-mono text-[9px] tracking-[0.12em] text-foreground/70">{p.category}</span>
                      <span className="font-mono text-[9px] text-foreground/45">{p.readTime}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Container>
          );
        })
      )}

      <div className="mt-24" />
    </>
  );
}
