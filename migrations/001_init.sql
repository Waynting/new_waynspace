-- Newsletter schema: subscribers + sent_articles
-- Safe to re-run: all CREATEs use IF NOT EXISTS.

CREATE EXTENSION IF NOT EXISTS "citext";

CREATE TABLE IF NOT EXISTS subscribers (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email               citext UNIQUE NOT NULL,
  confirmation_token  text UNIQUE,
  confirmed_at        timestamptz,
  unsubscribe_token   text UNIQUE NOT NULL,
  unsubscribed_at     timestamptz,
  source              text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscribers_active_idx
  ON subscribers (id)
  WHERE confirmed_at IS NOT NULL AND unsubscribed_at IS NULL;

CREATE TABLE IF NOT EXISTS sent_articles (
  slug              text PRIMARY KEY,
  subject           text NOT NULL,
  sent_at           timestamptz NOT NULL DEFAULT now(),
  recipient_count   integer NOT NULL DEFAULT 0,
  resend_batch_id   text
);
