/**
 * upload-photos.ts
 * 上傳本地照片到 R2，強制壓縮後才上傳
 *
 * Usage:
 *   npm run upload:photos -- <本地路徑> <R2資料夾>
 *
 * Example:
 *   npm run upload:photos -- ~/Desktop/new-photos Ver-1/Ver-1.12
 */

import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { compressImage } from "./lib/compress-image";

const args = process.argv.slice(2);
const localPath = args[0];
const r2Folder = args[1];

if (!localPath || !r2Folder) {
  console.error("Usage: npm run upload:photos -- <local-path> <r2-folder>");
  console.error("Example: npm run upload:photos -- ~/Desktop/photos Ver-1/Ver-1.12");
  process.exit(1);
}

const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".tiff"];

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function collectFiles(dirOrFile: string): string[] {
  const resolved = path.resolve(dirOrFile.replace(/^~/, process.env.HOME ?? "~"));
  if (!fs.existsSync(resolved)) {
    throw new Error(`Path not found: ${resolved}`);
  }
  const stat = fs.statSync(resolved);
  if (stat.isFile()) {
    const ext = path.extname(resolved).toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(ext) ? [resolved] : [];
  }
  return fs
    .readdirSync(resolved)
    .filter((f) => SUPPORTED_EXTENSIONS.includes(path.extname(f).toLowerCase()))
    .map((f) => path.join(resolved, f))
    .sort();
}

async function main() {
  console.log("\n📤 Photo Uploader (compress → upload)\n");

  const files = collectFiles(localPath);
  if (files.length === 0) {
    console.error("❌ No supported image files found at:", localPath);
    process.exit(1);
  }

  console.log(`📁 Local path   : ${localPath}`);
  console.log(`📂 R2 folder    : ${r2Folder}`);
  console.log(`📸 Files found  : ${files.length}`);
  console.log();

  const { r2Client, R2_BUCKET_NAME } = await import("../lib/r2");
  if (!r2Client) throw new Error("R2 credentials required");

  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const R2_BUCKET_PREFIX = process.env.R2_BUCKET_PREFIX ?? "";

  let totalOriginal = 0;
  let totalCompressed = 0;
  let uploadedCount = 0;
  let failedCount = 0;

  console.log("─".repeat(70));

  for (const filePath of files) {
    const originalName = path.basename(filePath);
    const outputName = originalName.replace(/\.[^.]+$/, ".webp");
    const r2Key = R2_BUCKET_PREFIX
      ? `${R2_BUCKET_PREFIX}${r2Folder}/${outputName}`
      : `${r2Folder}/${outputName}`;

    try {
      const inputBuffer = fs.readFileSync(filePath);
      process.stdout.write(`  ${originalName} → ${outputName} ... `);

      const result = await compressImage(inputBuffer, originalName);

      totalOriginal += result.originalSize;
      totalCompressed += result.compressedSize;

      const savedBytes = result.originalSize - result.compressedSize;
      const ratio = result.originalSize > 0
        ? ((savedBytes / result.originalSize) * 100).toFixed(1)
        : "0.0";
      const sizeStr = result.skipped
        ? `${formatBytes(result.originalSize)} (no compress: ${result.skipReason})`
        : `${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)} (-${ratio}%)`;

      const putCmd = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: r2Key,
        Body: result.buffer,
        ContentType: result.skipped ? undefined : "image/webp",
        Metadata: result.width && result.height
          ? {
              "x-amz-meta-width": String(result.width),
              "x-amz-meta-height": String(result.height),
            }
          : undefined,
      });

      await r2Client.send(putCmd);
      uploadedCount++;
      console.log(`✅ ${sizeStr}`);
    } catch (err) {
      failedCount++;
      console.log(`❌ FAILED: ${err}`);
    }
  }

  console.log("─".repeat(70));
  console.log("\n📊 Upload Summary:");
  console.log(`   Uploaded    : ${uploadedCount}`);
  console.log(`   Failed      : ${failedCount}`);
  if (totalOriginal > 0) {
    const saved = totalOriginal - totalCompressed;
    const ratio = ((saved / totalOriginal) * 100).toFixed(1);
    console.log(`   Original    : ${formatBytes(totalOriginal)}`);
    console.log(`   Uploaded as : ${formatBytes(totalCompressed)}`);
    console.log(`   Saved       : ${formatBytes(saved)} (-${ratio}%)`);
  }

  if (uploadedCount > 0) {
    console.log("\n⚠️  Don't forget:");
    console.log("   npm run generate:photos   # Update manifest\n");
  }
}

main().catch((err) => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
