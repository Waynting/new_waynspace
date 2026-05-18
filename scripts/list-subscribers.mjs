#!/usr/bin/env node
// List newsletter subscribers from Neon Postgres.
//
// Usage:
//   npm run subscribers              # 已確認訂閱者
//   npm run subscribers -- --all     # 全部（含未確認、退訂）
//   npm run subscribers -- --pending # 只看尚未確認
//   npm run subscribers -- --csv     # 輸出 CSV
//
// Requires POSTGRES_URL in env (run `vercel env pull .env.local` first).

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as dotenv } from 'dotenv';
import { neon } from '@neondatabase/serverless';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv({ path: path.join(__dirname, '..', '.env.local') });
dotenv({ path: path.join(__dirname, '..', '.env') });

const args = new Set(process.argv.slice(2));
const showAll = args.has('--all');
const onlyPending = args.has('--pending');
const asCsv = args.has('--csv');

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toISOString().slice(0, 16).replace('T', ' ');
}

function csvCell(v) {
  const s = v == null ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function statusOf(row) {
  if (row.unsubscribed_at) return 'unsubscribed';
  if (row.confirmed_at) return 'confirmed';
  return 'pending';
}

async function run() {
  if (!process.env.POSTGRES_URL) {
    console.error('✗ POSTGRES_URL 未設定。請先執行：vercel env pull .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.POSTGRES_URL);

  const rows = showAll
    ? await sql`
        SELECT email, confirmed_at, unsubscribed_at, source, created_at
        FROM subscribers
        ORDER BY created_at DESC
      `
    : onlyPending
      ? await sql`
          SELECT email, confirmed_at, unsubscribed_at, source, created_at
          FROM subscribers
          WHERE confirmed_at IS NULL AND unsubscribed_at IS NULL
          ORDER BY created_at DESC
        `
      : await sql`
          SELECT email, confirmed_at, unsubscribed_at, source, created_at
          FROM subscribers
          WHERE confirmed_at IS NOT NULL AND unsubscribed_at IS NULL
          ORDER BY created_at DESC
        `;

  if (asCsv) {
    console.log('email,status,source,created_at,confirmed_at,unsubscribed_at');
    for (const r of rows) {
      console.log(
        [
          r.email,
          statusOf(r),
          r.source ?? '',
          fmtDate(r.created_at),
          fmtDate(r.confirmed_at),
          fmtDate(r.unsubscribed_at),
        ]
          .map(csvCell)
          .join(',')
      );
    }
    return;
  }

  const totals = await sql`
    SELECT
      COUNT(*) FILTER (WHERE confirmed_at IS NOT NULL AND unsubscribed_at IS NULL) AS confirmed,
      COUNT(*) FILTER (WHERE confirmed_at IS NULL AND unsubscribed_at IS NULL) AS pending,
      COUNT(*) FILTER (WHERE unsubscribed_at IS NOT NULL) AS unsubscribed,
      COUNT(*) AS total
    FROM subscribers
  `;
  const t = totals[0];

  console.log('');
  console.log(`已確認：${t.confirmed}    待確認：${t.pending}    退訂：${t.unsubscribed}    總計：${t.total}`);
  console.log('');

  const label = showAll ? '全部' : onlyPending ? '待確認' : '已確認';
  console.log(`— ${label}訂閱者（${rows.length}）—`);
  if (rows.length === 0) {
    console.log('（無）');
    return;
  }

  const emailW = Math.max(...rows.map((r) => r.email.length), 5);
  const statusW = 12;
  const sourceW = Math.max(...rows.map((r) => (r.source ?? '').length), 6);

  const pad = (s, n) => String(s).padEnd(n);
  console.log(
    pad('email', emailW) +
      '  ' +
      pad('status', statusW) +
      '  ' +
      pad('source', sourceW) +
      '  ' +
      'created_at'
  );
  console.log('-'.repeat(emailW + statusW + sourceW + 22));
  for (const r of rows) {
    console.log(
      pad(r.email, emailW) +
        '  ' +
        pad(statusOf(r), statusW) +
        '  ' +
        pad(r.source ?? '—', sourceW) +
        '  ' +
        fmtDate(r.created_at)
    );
  }
}

run().catch((err) => {
  console.error('✗ 查詢失敗：', err);
  process.exit(1);
});
