import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { devOnly } from '@/lib/r2';

export async function POST() {
  const guard = devOnly();
  if (guard) return guard;

  revalidateTag('portfolio', 'default');
  return NextResponse.json({ ok: true, revalidated: true });
}
