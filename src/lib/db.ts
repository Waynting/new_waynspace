import { neon } from '@neondatabase/serverless';
import { createToken } from './tokens';

export type Subscriber = {
  id: string;
  email: string;
  confirmation_token: string | null;
  confirmed_at: Date | null;
  unsubscribe_token: string;
  unsubscribed_at: Date | null;
  source: string | null;
  created_at: Date;
};

export type SubscribeResult =
  | { status: 'created'; subscriber: Subscriber }
  | { status: 'pending'; subscriber: Subscriber } // re-issued token for unconfirmed
  | { status: 'already_confirmed' };

const connectionString =
  process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? '';

const sql = neon(connectionString);

/**
 * Insert a new subscriber, or re-issue a confirmation token if they already
 * exist but never confirmed. If they're already confirmed, do nothing.
 */
export async function upsertSubscriber(
  email: string,
  source: string | null
): Promise<SubscribeResult> {
  const confirmation_token = createToken();
  const unsubscribe_token = createToken();

  const existing = (await sql`
    SELECT * FROM subscribers WHERE email = ${email} LIMIT 1
  `) as Subscriber[];

  if (existing.length > 0) {
    const row = existing[0];
    if (row.unsubscribed_at) {
      // Re-opt-in: clear unsubscribed_at, reset confirmation flow
      const updated = (await sql`
        UPDATE subscribers
        SET confirmation_token = ${confirmation_token},
            confirmed_at = NULL,
            unsubscribed_at = NULL,
            source = ${source}
        WHERE id = ${row.id}
        RETURNING *
      `) as Subscriber[];
      return { status: 'pending', subscriber: updated[0] };
    }
    if (row.confirmed_at) {
      return { status: 'already_confirmed' };
    }
    // Unconfirmed — re-issue token
    const updated = (await sql`
      UPDATE subscribers
      SET confirmation_token = ${confirmation_token},
          source = ${source}
      WHERE id = ${row.id}
      RETURNING *
    `) as Subscriber[];
    return { status: 'pending', subscriber: updated[0] };
  }

  const inserted = (await sql`
    INSERT INTO subscribers
      (email, confirmation_token, unsubscribe_token, source)
    VALUES
      (${email}, ${confirmation_token}, ${unsubscribe_token}, ${source})
    RETURNING *
  `) as Subscriber[];
  return { status: 'created', subscriber: inserted[0] };
}

export async function confirmSubscriberByToken(
  token: string
): Promise<Subscriber | null> {
  const rows = (await sql`
    UPDATE subscribers
    SET confirmed_at = COALESCE(confirmed_at, now()),
        confirmation_token = NULL
    WHERE confirmation_token = ${token}
    RETURNING *
  `) as Subscriber[];
  return rows[0] ?? null;
}

export async function unsubscribeByToken(
  token: string
): Promise<Subscriber | null> {
  const rows = (await sql`
    UPDATE subscribers
    SET unsubscribed_at = COALESCE(unsubscribed_at, now())
    WHERE unsubscribe_token = ${token}
    RETURNING *
  `) as Subscriber[];
  return rows[0] ?? null;
}

export async function getConfirmedSubscribers(): Promise<Subscriber[]> {
  return (await sql`
    SELECT * FROM subscribers
    WHERE confirmed_at IS NOT NULL
      AND unsubscribed_at IS NULL
  `) as Subscriber[];
}

/**
 * Insert sent_articles row BEFORE sending, so a crash mid-send doesn't
 * cause a retry to re-send. Returns false if the slug is already reserved
 * (i.e. previously sent or in-flight) — callers should treat that as "skip".
 */
export async function reserveArticleSend(
  slug: string,
  subject: string,
  recipient_count: number
): Promise<boolean> {
  const rows = (await sql`
    INSERT INTO sent_articles (slug, subject, recipient_count)
    VALUES (${slug}, ${subject}, ${recipient_count})
    ON CONFLICT (slug) DO NOTHING
    RETURNING slug
  `) as { slug: string }[];
  return rows.length > 0;
}

export async function updateArticleResendBatchId(
  slug: string,
  batchId: string
): Promise<void> {
  await sql`
    UPDATE sent_articles SET resend_batch_id = ${batchId} WHERE slug = ${slug}
  `;
}
