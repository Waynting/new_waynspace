import { NextResponse } from 'next/server';

const BUTTONDOWN_ENDPOINT = 'https://api.buttondown.email/v1/subscribers';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Newsletter service is not configured.' },
      { status: 500 }
    );
  }

  let email: unknown;
  try {
    const body = await req.json();
    email = body?.email;
  } catch {
    return NextResponse.json({ error: '無效的請求格式' }, { status: 400 });
  }

  if (typeof email !== 'string' || !emailPattern.test(email.trim())) {
    return NextResponse.json({ error: '請輸入有效的 Email' }, { status: 400 });
  }

  const res = await fetch(BUTTONDOWN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email_address: email.trim() }),
  });

  if (res.ok) {
    return NextResponse.json({ ok: true });
  }

  // Buttondown returns 400 with { code: 'email_already_exists' } or similar
  let detail = '';
  try {
    const data = await res.json();
    detail = data?.code || data?.detail || '';
  } catch {
    /* ignore */
  }

  if (res.status === 400 && /already|exists/i.test(detail)) {
    return NextResponse.json({ ok: true, alreadySubscribed: true });
  }

  return NextResponse.json(
    { error: '訂閱失敗，請稍後再試' },
    { status: 502 }
  );
}
