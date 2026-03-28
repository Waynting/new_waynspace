'use client'

import { useEffect, useRef } from 'react'
import { trackArticleView, trackScrollDepth, trackReadComplete } from '@/lib/analytics'

interface ArticleTrackerProps {
  title: string
  category: string
  slug: string
  readTime: string
}

/**
 * Invisible component that fires GA4 events for:
 * - article_view  (on mount)
 * - scroll_depth  (25 / 50 / 75 / 100 %)
 * - read_complete (when user scrolls past the article footer)
 */
export default function ArticleTracker({ title, category, slug, readTime }: ArticleTrackerProps) {
  const fired = useRef<Set<number>>(new Set())
  const readCompleteFired = useRef(false)

  // article_view on mount
  useEffect(() => {
    trackArticleView({ title, category, slug })
  }, [title, category, slug])

  // scroll depth tracking
  useEffect(() => {
    const thresholds = [25, 50, 75, 100]

    function onScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return

      const percent = Math.min(Math.round((scrollTop / docHeight) * 100), 100)

      for (const t of thresholds) {
        if (percent >= t && !fired.current.has(t)) {
          fired.current.add(t)
          trackScrollDepth(t, title)
        }
      }

      // read_complete when scrolled past 90%
      if (percent >= 90 && !readCompleteFired.current) {
        readCompleteFired.current = true
        trackReadComplete(title, readTime)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [title, readTime])

  return null
}
