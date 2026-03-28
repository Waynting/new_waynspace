#!/usr/bin/env node
/**
 * R2 個人照片重新壓縮腳本
 *
 * 功能：
 * 1. 列出 R2 bucket 中 personal-photos/ 前綴下的所有物件
 * 2. 下載每張照片
 * 3. 使用 sharp 重新壓縮：最大寬度 1600px、WebP quality 72、移除 metadata
 * 4. 重新上傳覆蓋原始檔案
 * 5. 顯示前後大小對比
 *
 * 使用方式：
 *   npm run photos:recompress
 *   npm run photos:recompress -- --dry-run
 *   npm run photos:recompress -- --skip-small 500
 *   npm run photos:recompress -- --concurrency 3
 */

import sharp from 'sharp'
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import pLimit from 'p-limit'
import dotenv from 'dotenv'

dotenv.config()

// --- Config ---

const R2_BUCKET = process.env.R2_BUCKET || 'blog-post'
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const PHOTOS_PREFIX = 'personal-photos/'
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']

if (!CF_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('❌ 缺少必要的環境變數：CF_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY')
  process.exit(1)
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

// --- CLI args ---

const args = process.argv.slice(2)

function hasFlag(name) {
  return args.includes(`--${name}`)
}

function getFlagValue(name, defaultValue) {
  const idx = args.indexOf(`--${name}`)
  if (idx === -1 || idx + 1 >= args.length) return defaultValue
  return args[idx + 1]
}

const DRY_RUN = hasFlag('dry-run')
const SKIP_SMALL = hasFlag('skip-small')
const SKIP_SMALL_THRESHOLD = Number(getFlagValue('skip-small', 500)) * 1024 // KB → bytes
const CONCURRENCY = Number(getFlagValue('concurrency', 1))

// --- Helpers ---

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function isImageKey(key) {
  const lower = key.toLowerCase()
  return IMAGE_EXTENSIONS.some(ext => lower.endsWith(ext))
}

async function streamToBuffer(stream) {
  const chunks = []
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

// --- Core ---

async function listAllPhotos() {
  const keys = []
  let continuationToken

  do {
    const cmd = new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: PHOTOS_PREFIX,
      ContinuationToken: continuationToken,
    })
    const res = await s3.send(cmd)

    if (res.Contents) {
      for (const obj of res.Contents) {
        if (obj.Key && isImageKey(obj.Key)) {
          keys.push({ key: obj.Key, size: obj.Size || 0 })
        }
      }
    }

    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined
  } while (continuationToken)

  return keys
}

async function recompressPhoto(photo) {
  const { key, size: originalSize } = photo

  // Skip small files
  if (SKIP_SMALL && originalSize < SKIP_SMALL_THRESHOLD) {
    console.log(`  ⚡ 跳過 (${formatBytes(originalSize)} < ${formatBytes(SKIP_SMALL_THRESHOLD)}): ${key}`)
    return { key, skipped: true, reason: 'small', originalSize, newSize: originalSize }
  }

  if (DRY_RUN) {
    console.log(`  🔍 [DRY RUN] 會處理: ${key} (${formatBytes(originalSize)})`)
    return { key, skipped: true, reason: 'dry-run', originalSize, newSize: originalSize }
  }

  // Download
  const getRes = await s3.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }))
  const originalBuffer = await streamToBuffer(getRes.Body)
  const actualOriginalSize = originalBuffer.length

  // Recompress
  const webpBuffer = await sharp(originalBuffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toBuffer()

  const newSize = webpBuffer.length

  // Determine the new key (.webp extension)
  const ext = key.substring(key.lastIndexOf('.'))
  const newKey = ext.toLowerCase() !== '.webp'
    ? key.substring(0, key.lastIndexOf('.')) + '.webp'
    : key

  // Upload
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: newKey,
    Body: webpBuffer,
    ContentType: 'image/webp',
  }))

  const saving = ((1 - newSize / actualOriginalSize) * 100).toFixed(1)
  console.log(`  ✅ ${key}`)
  console.log(`     ${formatBytes(actualOriginalSize)} → ${formatBytes(newSize)} (節省 ${saving}%)`)

  return { key, skipped: false, originalSize: actualOriginalSize, newSize }
}

// --- Main ---

async function main() {
  console.log(`🚀 R2 個人照片重新壓縮\n`)
  console.log(`   Bucket: ${R2_BUCKET}`)
  console.log(`   Prefix: ${PHOTOS_PREFIX}`)
  console.log(`   Max width: 1600px, WebP quality: 72`)
  console.log(`   Concurrency: ${CONCURRENCY}`)
  if (DRY_RUN) console.log(`   ⚠️  DRY RUN 模式 — 不會實際上傳`)
  if (SKIP_SMALL) console.log(`   跳過小於 ${formatBytes(SKIP_SMALL_THRESHOLD)} 的檔案`)
  console.log()

  // List all photos
  console.log('📋 正在列出照片...')
  const photos = await listAllPhotos()

  if (photos.length === 0) {
    console.log('⚠️  沒有找到任何照片')
    process.exit(0)
  }

  console.log(`找到 ${photos.length} 張照片\n`)

  // Process
  const limit = pLimit(CONCURRENCY)
  const results = []

  const tasks = photos.map(photo =>
    limit(async () => {
      try {
        const result = await recompressPhoto(photo)
        results.push(result)
      } catch (err) {
        console.error(`  ❌ 失敗: ${photo.key} — ${err.message}`)
        results.push({ key: photo.key, skipped: false, error: true, originalSize: photo.size, newSize: photo.size })
      }
    })
  )

  await Promise.all(tasks)

  // Summary
  const processed = results.filter(r => !r.skipped && !r.error)
  const skipped = results.filter(r => r.skipped)
  const errors = results.filter(r => r.error)
  const totalOriginal = processed.reduce((sum, r) => sum + r.originalSize, 0)
  const totalNew = processed.reduce((sum, r) => sum + r.newSize, 0)
  const totalSaved = totalOriginal - totalNew

  console.log(`\n${'='.repeat(50)}`)
  console.log(`✨ 完成！`)
  console.log(`   總照片數: ${results.length}`)
  console.log(`   已處理:   ${processed.length}`)
  console.log(`   已跳過:   ${skipped.length}`)
  console.log(`   失敗:     ${errors.length}`)

  if (processed.length > 0) {
    console.log(`\n   壓縮前平均: ${formatBytes(Math.round(totalOriginal / processed.length))}`)
    console.log(`   壓縮後平均: ${formatBytes(Math.round(totalNew / processed.length))}`)
    console.log(`   總共節省:   ${formatBytes(totalSaved)} (${((totalSaved / totalOriginal) * 100).toFixed(1)}%)`)
  }

  if (errors.length > 0) process.exit(1)
}

main().catch(err => {
  console.error('❌ 嚴重錯誤:', err)
  process.exit(1)
})
