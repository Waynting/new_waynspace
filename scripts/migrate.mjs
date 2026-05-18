#!/usr/bin/env node
// Runs SQL files in /migrations in sorted order against POSTGRES_URL.
// Each file is executed as a single transaction. Statements are split on ';' at line ends.
// Re-runnable thanks to IF NOT EXISTS in each migration.
//
// Usage:
//   node scripts/migrate.mjs
//
// Requires POSTGRES_URL in env (run `vercel env pull .env.local` first).

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as dotenv } from 'dotenv';
import { createClient } from '@vercel/postgres';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv({ path: path.join(__dirname, '..', '.env.local') });
dotenv({ path: path.join(__dirname, '..', '.env') });

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

async function run() {
  if (!process.env.POSTGRES_URL) {
    console.error('✗ POSTGRES_URL not set. Run: vercel env pull .env.local');
    process.exit(1);
  }

  const files = (await fs.readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No migrations to run.');
    return;
  }

  const client = createClient();
  await client.connect();

  try {
    for (const file of files) {
      const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), 'utf-8');
      console.log(`→ ${file}`);
      await client.sql`BEGIN`;
      try {
        await client.query(sql);
        await client.sql`COMMIT`;
        console.log(`  ✓ applied`);
      } catch (err) {
        await client.sql`ROLLBACK`;
        throw err;
      }
    }
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('✗ migration failed:', err);
  process.exit(1);
});
