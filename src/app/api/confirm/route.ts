import { NextResponse } from 'next/server';
import { confirmSubscriberByToken } from '@/lib/db';
import { getBaseUrl } from '@/lib/resend';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const base = getBaseUrl(req);
  const token = new URL(req.url).searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(`${base}/subscribe/check-email?error=missing`);
  }
  const sub = await confirmSubscriberByToken(token);
  if (!sub) {
    return NextResponse.redirect(`${base}/subscribe/check-email?error=invalid`);
  }
  return NextResponse.redirect(`${base}/subscribed`);
}
