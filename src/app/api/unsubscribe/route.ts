import { NextResponse } from 'next/server';
import { unsubscribeByToken } from '@/lib/db';
import { getBaseUrl } from '@/lib/resend';

export const runtime = 'nodejs';

async function handle(req: Request, token: string | null, status: 302 | 303) {
  const base = getBaseUrl(req);
  if (!token) {
    return NextResponse.redirect(`${base}/unsubscribed?error=missing`, status);
  }
  const sub = await unsubscribeByToken(token);
  if (!sub) {
    return NextResponse.redirect(`${base}/unsubscribed?error=invalid`, status);
  }
  return NextResponse.redirect(`${base}/unsubscribed`, status);
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token');
  return handle(req, token, 302);
}

// One-click unsubscribe (RFC 8058 / List-Unsubscribe-Post header).
// 303 forces POST → GET on the redirect target so the body isn't replayed.
export async function POST(req: Request) {
  const url = new URL(req.url);
  let token = url.searchParams.get('token');
  if (!token) {
    try {
      const form = await req.formData();
      const v = form.get('token');
      if (typeof v === 'string') token = v;
    } catch {
      /* ignore */
    }
  }
  return handle(req, token, 303);
}
