'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Post, Category } from '@/types/blog';
import { trackCategoryFilter } from '@/lib/analytics';

interface BlogClientProps {
  posts: Post[];
  categories: (Category & { count: number })[];
}

function formatDate(dateStr: string): { month: string; day: string } {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { month: '--', day: '--' };
  return {
    month: String(d.getMonth() + 1).padStart(2, '0'),
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
      const cat = categories.find(c => c.slug === selectedCategory);
      if (cat) filtered = filtered.filter(p => p.category === cat.name);
    }
    return [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [posts, selectedCategory, categories]);

  // Group by year
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
    <main className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24 space-y-12">

      {/* Page Header */}
      <header>
        <p className="text-xs text-muted-foreground font-medium tracking-[0.2em] uppercase mb-4">
          Wei-Ting Liu
        </p>
        <div className="flex items-baseline gap-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Articles</h1>
          <span className="text-sm text-muted-foreground font-light tabular-nums">
            {filteredPosts.length}
          </span>
        </div>
      </header>

      {/* Category Filter — minimal text tabs */}
      <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Filter by category">
        <button
          onClick={() => { setSelectedCategory(null); trackCategoryFilter('All'); }}
          className={`text-sm transition-colors pb-0.5 ${
            selectedCategory === null
              ? 'text-foreground font-medium border-b border-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.slug}
            onClick={() => { setSelectedCategory(cat.slug); trackCategoryFilter(cat.name); }}
            className={`text-sm transition-colors pb-0.5 ${
              selectedCategory === cat.slug
                ? 'text-foreground font-medium border-b border-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.name}
            <span className="ml-1 text-xs text-muted-foreground/60 font-light tabular-nums">
              {cat.count}
            </span>
          </button>
        ))}
      </nav>

      {/* Article list grouped by year */}
      {byYear.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">暫無文章</p>
      ) : (
        <div className="space-y-14">
          {byYear.map(([year, yearPosts]) => (
            <section key={year}>
              {/* Year heading */}
              <div className="flex items-baseline gap-3 mb-6 border-b border-border pb-3">
                <span className="text-xs font-light tabular-nums text-muted-foreground w-5 shrink-0">
                  {/* spacer to align with numbered sections on /about */}
                </span>
                <div className="flex items-baseline gap-3 w-full">
                  <h2 className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                    {year}
                  </h2>
                  <span className="text-xs text-muted-foreground/50 font-light tabular-nums ml-auto">
                    {yearPosts.length} 篇
                  </span>
                </div>
              </div>

              {/* Article rows */}
              <div className="space-y-0">
                {yearPosts.map((post, i) => {
                  const { month, day } = formatDate(post.date);
                  return (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className={`group flex items-start gap-5 py-4 transition-colors hover:bg-muted/30 -mx-3 px-3 rounded-sm ${
                        i < yearPosts.length - 1 ? 'border-b border-border/50' : ''
                      }`}
                    >
                      {/* Date */}
                      <span className="text-xs text-muted-foreground font-light tabular-nums shrink-0 pt-0.5 w-9">
                        {month}/{day}
                      </span>

                      {/* Title + excerpt */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium leading-snug group-hover:text-foreground text-foreground/90 line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-1">
                            {post.excerpt}
                          </p>
                        )}
                      </div>

                      {/* Category */}
                      <span className="text-xs text-muted-foreground/60 font-light shrink-0 hidden sm:block pt-0.5 max-w-[7rem] text-right leading-snug">
                        {post.category}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
