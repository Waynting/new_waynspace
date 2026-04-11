import { generateRSS } from '@/lib/feed'

export const dynamic = 'force-static'

export async function GET() {
  const rss = await generateRSS()

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
