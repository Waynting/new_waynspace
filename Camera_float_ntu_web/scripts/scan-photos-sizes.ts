/**
 * scan-photos-sizes.ts
 * 純唯讀掃描腳本，分析 manifest 中所有照片的大小分佈
 *
 * Usage:
 *   npm run scan:photos              # 從 manifest 讀取（快速）
 *   npm run scan:photos -- --live    # 直接向 R2 查詢（較慢）
 */

import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const args = process.argv.slice(2);
const isLive = args.includes("--live");

const MANIFEST_INDEX_PATH = path.resolve(process.cwd(), "public/photos-manifest/index.json");
const MANIFEST_DIR = path.resolve(process.cwd(), "public/photos-manifest");
const OUTPUT_PATH = path.resolve(process.cwd(), "scripts/output/compression-report.json");

interface SizeDistribution {
  lt500KB: number;
  "500KB-1MB": number;
  "1MB-5MB": number;
  "5MB-10MB": number;
  gt10MB: number;
}

interface FormatCount {
  [ext: string]: number;
}

interface PhotoEntry {
  key: string;
  name: string;
  size?: number;
}

function categorizeSizeBytes(bytes: number): keyof SizeDistribution {
  if (bytes < 500 * 1024) return "lt500KB";
  if (bytes < 1 * 1024 * 1024) return "500KB-1MB";
  if (bytes < 5 * 1024 * 1024) return "1MB-5MB";
  if (bytes < 10 * 1024 * 1024) return "5MB-10MB";
  return "gt10MB";
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

async function scanFromManifest(): Promise<PhotoEntry[]> {
  if (!fs.existsSync(MANIFEST_INDEX_PATH)) {
    console.error("❌ Manifest not found:", MANIFEST_INDEX_PATH);
    console.error("   Run: npm run generate:photos");
    process.exit(1);
  }

  const index = JSON.parse(fs.readFileSync(MANIFEST_INDEX_PATH, "utf-8"));
  const photos: PhotoEntry[] = [];

  for (const [folderName, folderMeta] of Object.entries(index.folders as Record<string, { file: string; total: number }>)) {
    const folderFile = path.join(MANIFEST_DIR, folderMeta.file);
    if (!fs.existsSync(folderFile)) {
      console.warn(`⚠️  Missing folder manifest: ${folderMeta.file}`);
      continue;
    }
    const folderData = JSON.parse(fs.readFileSync(folderFile, "utf-8"));
    for (const photo of folderData.photos ?? []) {
      photos.push(photo);
    }
  }

  return photos;
}

async function scanFromR2(): Promise<PhotoEntry[]> {
  const { r2Client, R2_BUCKET_NAME } = await import("../lib/r2");
  const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");

  if (!r2Client) throw new Error("R2 credentials required for --live mode");

  const R2_BUCKET_PREFIX = process.env.R2_BUCKET_PREFIX || "";
  const photos: PhotoEntry[] = [];
  let continuationToken: string | undefined;

  console.log("📡 Querying R2 directly...");

  do {
    const cmd = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: R2_BUCKET_PREFIX,
      ContinuationToken: continuationToken,
    });
    const resp = await r2Client.send(cmd);

    for (const obj of resp.Contents ?? []) {
      if (/\.(jpg|jpeg|png|webp|heic|heif|tiff)$/i.test(obj.Key ?? "")) {
        photos.push({
          key: obj.Key ?? "",
          name: (obj.Key ?? "").split("/").pop() ?? "",
          size: obj.Size,
        });
      }
    }

    continuationToken = resp.NextContinuationToken;
    process.stdout.write(`\r  Found ${photos.length} photos...`);
  } while (continuationToken);

  console.log();
  return photos;
}

async function main() {
  console.log(`\n📊 Photo Size Scanner (${isLive ? "live R2 mode" : "manifest mode"})\n`);

  const photos = isLive ? await scanFromR2() : await scanFromManifest();

  const dist: SizeDistribution = {
    lt500KB: 0,
    "500KB-1MB": 0,
    "1MB-5MB": 0,
    "5MB-10MB": 0,
    gt10MB: 0,
  };
  const formats: FormatCount = {};

  let totalSize = 0;
  let photosWithSize = 0;
  let maxSize = 0;
  let minSize = Infinity;

  for (const photo of photos) {
    const ext = photo.name.split(".").pop()?.toLowerCase() ?? "unknown";
    formats[ext] = (formats[ext] ?? 0) + 1;

    if (photo.size != null) {
      photosWithSize++;
      totalSize += photo.size;
      if (photo.size > maxSize) maxSize = photo.size;
      if (photo.size < minSize) minSize = photo.size;
      const cat = categorizeSizeBytes(photo.size);
      dist[cat]++;
    }
  }

  const avgSize = photosWithSize > 0 ? totalSize / photosWithSize : 0;

  // Estimate compressed size (lossy WebP ~8% of current lossless WebP)
  const COMPRESSION_RATIO = 0.08;
  const estimatedCompressedTotal = totalSize * COMPRESSION_RATIO;

  console.log("─".repeat(50));
  console.log(`  Total photos      : ${photos.length}`);
  console.log(`  Photos with size  : ${photosWithSize}`);
  console.log(`  Total size        : ${formatBytes(totalSize)}`);
  console.log(`  Average size      : ${formatBytes(avgSize)}`);
  console.log(`  Max size          : ${formatBytes(maxSize)}`);
  console.log(`  Min size          : ${formatBytes(minSize === Infinity ? 0 : minSize)}`);
  console.log(`  Est. after compress: ${formatBytes(estimatedCompressedTotal)} (at ~8% ratio)`);
  console.log();
  console.log("  Size distribution:");
  console.log(`    < 500 KB        : ${dist.lt500KB} photos`);
  console.log(`    500 KB – 1 MB   : ${dist["500KB-1MB"]} photos`);
  console.log(`    1 MB – 5 MB     : ${dist["1MB-5MB"]} photos`);
  console.log(`    5 MB – 10 MB    : ${dist["5MB-10MB"]} photos`);
  console.log(`    > 10 MB         : ${dist.gt10MB} photos`);
  console.log();
  console.log("  Formats:");
  for (const [ext, count] of Object.entries(formats).sort((a, b) => b[1] - a[1])) {
    console.log(`    .${ext.padEnd(8)}: ${count}`);
  }
  console.log("─".repeat(50));

  const report = {
    generatedAt: new Date().toISOString(),
    mode: isLive ? "live" : "manifest",
    totalPhotos: photos.length,
    photosWithSize,
    totalSizeBytes: totalSize,
    avgSizeBytes: avgSize,
    maxSizeBytes: maxSize,
    minSizeBytes: minSize === Infinity ? 0 : minSize,
    estimatedCompressedTotalBytes: estimatedCompressedTotal,
    sizeDistribution: dist,
    formats,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2));
  console.log(`\n✅ Report saved to: ${OUTPUT_PATH}\n`);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
