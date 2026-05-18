import { NextResponse } from 'next/server';
import { upsertSubscriber } from '@/lib/db';
import { sendEmail, getBaseUrl } from '@/lib/resend';
import { ConfirmEmail } from '@/emails/ConfirmEmail';

export const runtime = 'nodejs';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubscribeBody = {
  email?: unknown;
  source?: unknown;
  website?: unknown; // honeypot — bots fill it
};

export async function POST(req: Request) {
  let body: SubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
    return NextResponse.json({ error: '無效的請求格式' }, { status: 400 });
  }

  // Honeypot: pretend success so bots don't learn
  if (typeof body.website === 'string' && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const emailRaw = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!emailRaw || !emailPattern.test(emailRaw)) {
    return NextResponse.json({ error: '請輸入有效的 Email' }, { status: 400 });
  }
  const source = typeof body.source === 'string' ? body.source.slice(0, 32) : null;

  try {
    const result = await upsertSubscriber(emailRaw, source);

    if (result.status === 'already_confirmed') {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }

    const { subscriber } = result;
    const baseUrl = getBaseUrl(req);
    const confirmUrl = `${baseUrl}/api/confirm?token=${encodeURIComponent(
      subscriber.confirmation_token!
    )}`;
    const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${encodeURIComponent(
      subscriber.unsubscribe_token
    )}`;

    await sendEmail({
      to: subscriber.email,
      subject: '請確認訂閱 Waynspace',
      react: ConfirmEmail({ confirmUrl, unsubscribeUrl, siteUrl: baseUrl }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('subscribe error', err);
    return NextResponse.json(
      { error: '訂閱失敗，請稍後再試' },
      { status: 500 }
    );
  }
}
