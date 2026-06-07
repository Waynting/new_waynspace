import { getPostSourceBySlug } from '@/lib/posts'
import { buildMediumHtml } from '@/lib/medium'

/**
 * 專供 Medium「Import a story」匯入用的乾淨 HTML 端點。
 * 用法：在 Medium 匯入框貼上 https://waynspace.com/medium/YYYY/MM/slug
 *
 * 這條路由刻意放在 /medium 而非 /blog/[...slug] 底下——catch-all 會吃光所有
 * 後續 segment，無法在其下再掛靜態子路由。回傳的是不含網站外殼的純文章 HTML。
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug: slugArray } = await params
  const slug = (Array.isArray(slugArray) ? slugArray : [slugArray])
    .map((part) => decodeURIComponent(part))
    .join('/')

  const source = await getPostSourceBySlug(slug)
  if (!source) {
    return new Response('Not found', { status: 404 })
  }

  const html = await buildMediumHtml({
    slug: source.slug,
    title: source.title,
    markdown: source.content,
    description: source.excerpt,
  })

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
