/**
 * batch-compress-r2.ts
 * 批次壓縮 R2 上所有照片（lossy WebP），原地覆蓋同一 key
 *
 * Usage:
 *   npm run compress:r2 -- --dry-run                      # 預覽，不上傳
 *   npm run compress:r2 -- --confirm                      # 實際執行
 *   npm run compress:r2 -- --folder Ver-1/Ver-1.1 --dry-run
 *   npm run compress:r2 -- --folder Ver-1/Ver-1.1 --confirm
 *   npm run compress:r2 -- --confirm --resume             # 從上次中斷點繼續
 */

import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { compressImage } from "./lib/compress-image";

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isConfirm = args.includes("--confirm");
const isResume = args.includes("--resume");
const folderIdx = args.indexOf("--folder");
const folderFilter = folderIdx !== -1 ? args[folderIdx + 1] : null;

if (!isDryRun && !isConfirm) {
  console.error("❌ Must specify --dry-run or --confirm");
  process.exit(1);
}

const isRetryFailed = args.includes("--retry-failed");

const CONCURRENCY = 3;
const SKIP_THRESHOLD = 500 * 1024; // 500 KB
const CHECKPOINT_PATH = path.resolve(process.cwd(), "scripts/output/compression-progress.json");
const MANIFEST_INDEX_PATH = path.resolve(process.cwd(), "public/photos-manifest/index.json");
const MANIFEST_DIR = path.resolve(process.cwd(), "public/photos-manifest");

interface Checkpoint {
  startedAt: string;
  processed: string[];
  skipped: string[];
  failed: string[];
  totalOriginalBytes: number;
  totalCompressedBytes: number;
}

function loadCheckpoint(): Checkpoint {
  if (isResume && fs.existsSync(CHECKPOINT_PATH)) {
    const data = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, "utf-8")) as Checkpoint;
    console.log(`♻️  Resuming from checkpoint: ${data.processed.length} already done`);
    return data;
  }
  return {
    startedAt: new Date().toISOString(),
    processed: [],
    skipped: [],
    failed: [],
    totalOriginalBytes: 0,
    totalCompressedBytes: 0,
  };
}

function saveCheckpoint(cp: Checkpoint) {
  fs.mkdirSync(path.dirname(CHECKPOINT_PATH), { recursive: true });
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(cp, null, 2));
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function getAllPhotos(): Promise<Array<{ key: string; name: string; size?: number }>> {
  if (!fs.existsSync(MANIFEST_INDEX_PATH)) {
    throw new Error(`Manifest not found: ${MANIFEST_INDEX_PATH}\nRun: npm run generate:photos`);
  }

  const index = JSON.parse(fs.readFileSync(MANIFEST_INDEX_PATH, "utf-8"));
  const photos: Array<{ key: string; name: string; size?: number }> = [];

  for (const [folderName, meta] of Object.entries(index.folders as Record<string, { file: string }>)) {
    if (folderFilter && folderName !== folderFilter) continue;

    const folderFile = path.join(MANIFEST_DIR, meta.file);
    if (!fs.existsSync(folderFile)) {
      console.warn(`⚠️  Missing: ${meta.file}`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(folderFile, "utf-8"));
    for (const photo of data.photos ?? []) {
      photos.push(photo);
    }
  }

  if (folderFilter && photos.length === 0) {
    throw new Error(`No photos found for folder: ${folderFilter}`);
  }

  return photos;
}

async function processPhoto(
  key: string,
  name: string,
  size: number | undefined,
  r2Client: NonNullable<(typeof import("../lib/r2"))["r2Client"]>,
  R2_BUCKET_NAME: string,
  cp: Checkpoint
): Promise<void> {
  // Skip if already below threshold
  if (size != null && size < SKIP_THRESHOLD) {
    console.log(`  ⏭️  SKIP (already small: ${formatBytes(size)}) ${name}`);
    cp.skipped.push(key);
    return;
  }

  try {
    // Download
    const { GetObjectCommand, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const getCmd = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
    const obj = await r2Client.send(getCmd);

    const chunks: Uint8Array[] = [];
    const stream = obj.Body as AsyncIterable<Uint8Array>;
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const inputBuffer = Buffer.concat(chunks);

    // Compress
    const result = await compressImage(inputBuffer, name);

    if (result.skipped) {
      console.log(`  ⏭️  SKIP (${result.skipReason}) ${name}`);
      cp.skipped.push(key);
      return;
    }

    const savedBytes = result.originalSize - result.compressedSize;
    const ratio = ((savedBytes / result.originalSize) * 100).toFixed(1);
    console.log(
      `  ✅ ${name}: ${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)} (-${ratio}%)`
    );

    if (!isDryRun) {
      const putCmd = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: result.buffer,
        ContentType: "image/webp",
      });
      await r2Client.send(putCmd);
    }

    cp.processed.push(key);
    cp.totalOriginalBytes += result.originalSize;
    cp.totalCompressedBytes += result.compressedSize;
  } catch (err) {
    console.error(`  ❌ FAILED ${name}:`, err);
    cp.failed.push(key);
  }
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  const queue = [...items];
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const item = queue.shift()!;
      await fn(item);
    }
  });
  await Promise.all(workers);
}

async function main() {
  console.log("\n🗜️  Batch R2 Compressor");
  console.log(`   Mode: ${isDryRun ? "DRY RUN (no upload)" : "LIVE (will overwrite R2)"}`);
  if (folderFilter) console.log(`   Folder filter: ${folderFilter}`);
  console.log();

  const r2Module = await import("../lib/r2");
  if (!r2Module.r2Client) throw new Error("R2 credentials required");
  const r2Client = r2Module.r2Client;
  const R2_BUCKET_NAME = r2Module.R2_BUCKET_NAME!;

  const allPhotos = await getAllPhotos();
  console.log(`📸 Total photos in scope: ${allPhotos.length}\n`);

  const cp = loadCheckpoint();
  if (isRetryFailed && cp.failed.length > 0) {
    console.log(`🔁 --retry-failed: clearing ${cp.failed.length} failed items for retry`);
    cp.failed = [];
    saveCheckpoint(cp);
  }
  const doneSet = new Set([...cp.processed, ...cp.skipped, ...cp.failed]);
  const toProcess = allPhotos.filter((p) => !doneSet.has(p.key));

  console.log(`📋 To process: ${toProcess.length} (${doneSet.size} already done)\n`);
  console.log("─".repeat(60));

  await runWithConcurrency(toProcess, CONCURRENCY, async (photo) => {
    await processPhoto(photo.key, photo.name, photo.size, r2Client, R2_BUCKET_NAME, cp);
    saveCheckpoint(cp);
  });

  console.log("─".repeat(60));
  console.log("\n📊 Summary:");
  console.log(`   Compressed : ${cp.processed.length}`);
  console.log(`   Skipped    : ${cp.skipped.length}`);
  console.log(`   Failed     : ${cp.failed.length}`);

  if (cp.totalOriginalBytes > 0) {
    const saved = cp.totalOriginalBytes - cp.totalCompressedBytes;
    const ratio = ((saved / cp.totalOriginalBytes) * 100).toFixed(1);
    console.log(`   Original   : ${formatBytes(cp.totalOriginalBytes)}`);
    console.log(`   Compressed : ${formatBytes(cp.totalCompressedBytes)}`);
    console.log(`   Saved      : ${formatBytes(saved)} (-${ratio}%)`);
  }

  if (!isDryRun) {
    console.log("\n⚠️  Next steps:");
    console.log("   1. Purge Cloudflare CDN cache (Dashboard > Caching > Purge Everything)");
    console.log("   2. npm run generate:photos");
  }

  console.log();
}

main().catch((err) => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
