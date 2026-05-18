#!/usr/bin/env node
// One-time migration: pull subscribers from Buttondown API and insert as
// confirmed in Postgres. Re-runnable (ON CONFLICT DO NOTHING).
//
// Requires:
//   BUTTONDOWN_API_KEY (existing)
//   POSTGRES_URL (from `vercel env pull .env.local`)

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { config as dotenv } from 'dotenv';
import { createClient } from '@vercel/postgres';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv({ path: path.join(__dirname, '..', '.env.local') });
dotenv({ path: path.join(__dirname, '..', '.env') });

function token() {
  return crypto.randomBytes(32).toString('base64url');
}

async function fetchAllSubscribers(apiKey) {
  const out = [];
  let url = 'https://api.buttondown.email/v1/subscribers?type=regular&page=1';
  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Token ${apiKey}` },
    });
    if (!res.ok) {
      throw new Error(`Buttondown API ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    for (const s of data.results ?? []) {
      out.push(s);
    }
    url = data.next ?? null;
  }
  return out;
}

async function run() {
  if (!process.env.BUTTONDOWN_API_KEY) {
    console.error('✗ BUTTONDOWN_API_KEY not set');
    process.exit(1);
  }
  if (!process.env.POSTGRES_URL) {
    console.error('✗ POSTGRES_URL not set. Run: vercel env pull .env.local');
    process.exit(1);
  }

  console.log('→ fetching subscribers from Buttondown...');
  const subs = await fetchAllSubscribers(process.env.BUTTONDOWN_API_KEY);
  console.log(`  fetched ${subs.length} subscribers`);

  const client = createClient();
  await client.connect();
  let imported = 0;
  let skipped = 0;
  try {
    for (const s of subs) {
      const email = (s.email_address ?? s.email ?? '').toLowerCase().trim();
      if (!email) {
        skipped++;
        continue;
      }
      const res = await client.sql`
        INSERT INTO subscribers
          (email, confirmed_at, unsubscribe_token, source)
        VALUES
          (${email}, now(), ${token()}, 'buttondown-migration')
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `;
      if (res.rows.length > 0) {
        imported++;
      } else {
        skipped++;
      }
    }
  } finally {
    await client.end();
  }
  console.log(`✓ imported ${imported}, skipped ${skipped}`);
}

run().catch((err) => {
  console.error('✗ migration failed:', err);
  process.exit(1);
});
