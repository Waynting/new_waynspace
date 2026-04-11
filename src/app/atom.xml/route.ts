import { generateAtom } from '@/lib/feed'

export const dynamic = 'force-static'

export async function GET() {
  const atom = await generateAtom()

  return new Response(atom, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
    },
  })
}
