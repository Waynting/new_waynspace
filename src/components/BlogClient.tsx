'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post, Category } from '@/types/blog';
import { trackCategoryFilter } from '@/lib/analytics';
import { Container } from '@/components/Container';

interface BlogClientProps {
  posts: Post[];
  categories: (Category & { count: number })[];
}

function formatMonthDay(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '--/--';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}`;
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

  const byYear = useMemo(() => {
    const map = new Map<number, Post[]>();
    for (const post of filteredPosts) {
      const yr = getYear(post.date);
      if (!map.has(yr)) map.set(yr, []);
      map.get(yr)!.push(post);
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [filteredPosts]);

  return (
    <>
      {/* Page Header */}
      <Container className="pt-16 pb-10">
        <div className="tracking-[0.2em] uppercase text-xs font-medium text-muted-foreground mb-4">
          Wei-Ting Liu
        </div>
        <div className="flex items-baseline gap-4">
          <h1 className="text-[40px] sm:text-[48px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground">
            Articles
          </h1>
          <span className="text-sm font-light text-muted-foreground tabular-nums">
            {filteredPosts.length}
          </span>
        </div>
      </Container>

      {/* Category Tabs */}
      <Container className="pb-10">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <button
            onClick={() => {
              setSelectedCategory(null);
              trackCategoryFilter('All');
            }}
            className={`text-sm transition-colors pb-0.5 ${
              selectedCategory === null
                ? 'font-medium text-foreground border-b border-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => {
                setSelectedCategory(cat.slug);
                trackCategoryFilter(cat.name);
              }}
              className={`text-sm transition-colors pb-0.5 ${
                selectedCategory === cat.slug
                  ? 'font-medium text-foreground border-b border-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.name} <span className="text-xs text-muted-foreground/70">{cat.count}</span>
            </button>
          ))}
        </div>
      </Container>

      {/* Year Archives */}
      {byYear.length === 0 ? (
        <Container className="pb-24">
          <p className="text-sm text-muted-foreground py-12 text-center">暫無文章</p>
        </Container>
      ) : (
        byYear.map(([year, yearPosts]) => (
          <Container key={year} className="pb-12">
            <div className="flex items-baseline mb-6 pb-3 gap-3 border-b border-border">
              <span className="tracking-[0.18em] uppercase text-xs font-semibold text-muted-foreground">
                {year}
              </span>
              <span className="ml-auto text-xs font-light text-muted-foreground/70 tabular-nums">
                {yearPosts.length} 篇
              </span>
            </div>
            <div className="flex flex-col">
              {yearPosts.map((post, i) => (
                <ArticleRow
                  key={post.slug}
                  post={post}
                  isLast={i === yearPosts.length - 1}
                />
              ))}
            </div>
          </Container>
        ))
      )}

      <div className="pb-12" />
    </>
  );
}

function ArticleRow({ post, isLast }: { post: Post; isLast: boolean }) {
  const cover = post.coverImage || post.featuredImage;
  const hasCover = Boolean(cover);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`row-link items-start py-5 px-3 gap-4 sm:gap-5 ${!isLast ? 'border-b border-border/60' : ''}`}
    >
      <div className="shrink-0 w-10 pt-1 tabular-nums">
        <span className="text-xs font-light text-muted-foreground">
          {formatMonthDay(post.date)}
        </span>
      </div>

      <div className="flex flex-col flex-1 min-w-0 gap-1">
        <h3 className="row-title text-[15px] sm:text-base leading-[1.4] font-medium text-foreground/90">
          {post.title}
          <span className="row-arrow text-foreground/50">→</span>
        </h3>
        {post.excerpt && (
          <p className="text-[13px] leading-[1.6] text-muted-foreground line-clamp-2">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground/70">
          <span>{post.category}</span>
          {post.readTime && (
            <>
              <span aria-hidden>·</span>
              <span>{post.readTime}</span>
            </>
          )}
        </div>
      </div>

      {hasCover ? (
        <div className="relative shrink-0 w-20 h-20 sm:w-[112px] sm:h-[84px] overflow-hidden rounded-sm bg-muted">
          <Image
            src={cover!}
            alt=""
            fill
            sizes="(max-width: 640px) 80px, 112px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="hidden sm:block shrink-0 w-[112px]" aria-hidden />
      )}
    </Link>
  );
}
