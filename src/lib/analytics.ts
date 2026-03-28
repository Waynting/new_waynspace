/**
 * GA4 custom event tracking utility.
 *
 * All custom events funnel through `trackEvent` so they can be
 * tested / stubbed in one place and are no-ops when gtag is absent.
 */

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, params)
  }
}

/* ─── Convenience wrappers (typed params) ─── */

export function trackArticleView(article: {
  title: string
  category: string
  slug: string
}) {
  trackEvent('article_view', {
    article_title: article.title,
    category: article.category,
    slug: article.slug,
  })
}

export function trackCategoryFilter(categoryName: string) {
  trackEvent('category_filter', { category_name: categoryName })
}

export function trackScrollDepth(percent: number, articleTitle: string) {
  trackEvent('scroll_depth', {
    percent,
    article_title: articleTitle,
  })
}

export function trackReadComplete(articleTitle: string, readTime: string) {
  trackEvent('read_complete', {
    article_title: articleTitle,
    read_time: readTime,
  })
}

export function trackCopyCode(articleTitle: string) {
  trackEvent('copy_code', { article_title: articleTitle })
}

export function trackNewsletterSubscribe(location: string) {
  trackEvent('newsletter_subscribe', { location })
}

export function trackPhotoView(photoIndex: number) {
  trackEvent('photo_view', { photo_index: photoIndex })
}

export function trackOutboundClick(url: string, linkText: string) {
  trackEvent('outbound_click', { url, link_text: linkText })
}
