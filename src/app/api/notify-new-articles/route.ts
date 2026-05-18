import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/posts';
import {
  getConfirmedSubscribers,
  reserveArticleSend,
  updateArticleResendBatchId,
} from '@/lib/db';
import { sendBatch, chunk, getBaseUrl } from '@/lib/resend';
import { ArticleEmail } from '@/emails/ArticleEmail';

export const runtime = 'nodejs';
export const maxDuration = 60;

function isAuthorized(req: Request) {
  const auth = req.headers.get('authorization') ?? '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const cron = process.env.CRON_SECRET;
  const admin = process.env.NEWSLETTER_SECRET;
  return (cron && bearer === cron) || (admin && bearer === admin);
}

type NotifyResult = {
  ok: true;
  sent: { slug: string; recipients: number; batchId?: string }[];
  skipped: string[];
};

async function run(req: Request, dryRun: boolean): Promise<NotifyResult | NextResponse> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const onlySlug = url.searchParams.get('slug');
  const baseUrl = getBaseUrl(req);

  const allPosts = await getAllPosts();
  const eligible = allPosts.filter((p) => {
    if (onlySlug && p.slug !== onlySlug) return false;
    return true;
  });

  const subscribers = await getConfirmedSubscribers();
  const sent: NotifyResult['sent'] = [];
  const skipped: string[] = [];

  // Per-subscriber URL doesn't change across posts — compute once.
  const subscriberLinks = subscribers.map((sub) => ({
    sub,
    unsubscribeUrl: `${baseUrl}/api/unsubscribe?token=${encodeURIComponent(
      sub.unsubscribe_token
    )}`,
  }));

  for (const post of eligible) {
    if (subscribers.length === 0) {
      skipped.push(post.slug);
      continue;
    }

    const subject = post.title;

    // reserveArticleSend is INSERT ... ON CONFLICT DO NOTHING. Returns false
    // when the slug already exists, so it doubles as the "already sent" check
    // and the reservation. Eliminates the N+1 hasArticleBeenSent loop and the
    // race window between check and reserve.
    if (!dryRun) {
      const reserved = await reserveArticleSend(post.slug, subject, subscribers.length);
      if (!reserved) {
        skipped.push(post.slug);
        continue;
      }
    }

    const articleUrl = `${baseUrl}/blog/${post.slug}`;
    const dateStr = (() => {
      try {
        const d = new Date(post.date);
        return isNaN(d.getTime()) ? post.date : d.toISOString().slice(0, 10);
      } catch {
        return post.date;
      }
    })();

    const items = subscriberLinks.map(({ sub, unsubscribeUrl }) => ({
      to: sub.email,
      subject,
      react: ArticleEmail({
        title: post.title,
        excerpt: post.excerpt ?? '',
        category: post.category,
        date: dateStr,
        readTime: post.readTime,
        coverImage: post.coverImage ?? post.featuredImage ?? null,
        articleUrl,
        unsubscribeUrl,
        siteUrl: baseUrl,
      }),
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:wayntingliu+unsub@gmail.com>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }));

    let firstBatchId: string | undefined;
    for (const batch of chunk(items, 100)) {
      const res = await sendBatch(batch);
      const data = Array.isArray(res) ? res : (res as { data?: { id: string }[] }).data;
      if (!firstBatchId && data && data[0]?.id) firstBatchId = data[0].id;
    }

    if (!dryRun && firstBatchId) {
      await updateArticleResendBatchId(post.slug, firstBatchId);
    }

    sent.push({ slug: post.slug, recipients: subscribers.length, batchId: firstBatchId });
  }

  return { ok: true, sent, skipped };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const dryRun = url.searchParams.get('dryRun') === '1';
  const result = await run(req, dryRun);
  if (result instanceof NextResponse) return result;
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const dryRun = url.searchParams.get('dryRun') === '1';
  const result = await run(req, dryRun);
  if (result instanceof NextResponse) return result;
  return NextResponse.json(result);
}
