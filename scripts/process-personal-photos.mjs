#!/usr/bin/env node
/**
 * 個人照片壓縮上傳腳本
 *
 * 功能：
 * 1. 掃描本地照片目錄
 * 2. 壓縮為 WebP (quality 80, max 2000px)
 * 3. 上傳到 Cloudflare R2 personal-photos/ 前綴
 *
 * 使用方式：
 *   npm run photos:process -- --dir /path/to/your/photos
 *   npm run photos:process -- --dir ./local-photos
 */

import sharp from 'sharp'
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { globby } from 'globby'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 從命令列參數取得照片目錄
const args = process.argv.slice(2)
const dirArgIndex = args.indexOf('--dir')
const PHOTOS_DIR = dirArgIndex !== -1 && args[dirArgIndex + 1]
  ? path.resolve(args[dirArgIndex + 1])
  : path.resolve(__dirname, '../local-photos')

const R2_BASE_URL = process.env.R2_BASE_URL || 'https://img.waynspace.com'
const R2_BUCKET = process.env.R2_BUCKET || 'blog-post'
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const PHOTOS_PREFIX = 'personal-photos'

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

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'tiff', 'avif']

async function r2Exists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    return true
  } catch {
    return false
  }
}

async function processPhoto(localPath) {
  const ext = path.extname(localPath).toLowerCase().replace('.', '')
  if (!IMAGE_EXTENSIONS.includes(ext)) return null

  const originalName = path.basename(localPath, path.extname(localPath))
  const cleanName = originalName
    .replace(/\s+/g, '-')
    .replace(/[^\w\-_.]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const r2Key = `${PHOTOS_PREFIX}/${cleanName}.webp`
  const cdnUrl = `${R2_BASE_URL}/${r2Key}`

  if (await r2Exists(r2Key)) {
    console.log(`  ⚡ 已存在，跳過: ${r2Key}`)
    return { skipped: true, cdnUrl }
  }

  const imageBuffer = await fs.readFile(localPath)
  const originalSize = imageBuffer.length

  const webpBuffer = await sharp(imageBuffer)
    .rotate() // 根據 EXIF 自動旋轉
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()

  const compressedSize = webpBuffer.length
  const saving = ((1 - compressedSize / originalSize) * 100).toFixed(1)

  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: r2Key,
    Body: webpBuffer,
    ContentType: 'image/webp',
  }))

  console.log(`  ✅ ${path.basename(localPath)} → ${r2Key}`)
  console.log(`     ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(compressedSize / 1024 / 1024).toFixed(2)} MB (節省 ${saving}%)`)

  return { skipped: false, cdnUrl }
}

async function main() {
  console.log(`🚀 開始處理個人照片\n`)
  console.log(`   來源目錄: ${PHOTOS_DIR}`)
  console.log(`   上傳位置: R2 ${R2_BUCKET}/${PHOTOS_PREFIX}/\n`)

  let dirExists = true
  try {
    await fs.access(PHOTOS_DIR)
  } catch {
    dirExists = false
  }

  if (!dirExists) {
    console.error(`❌ 目錄不存在: ${PHOTOS_DIR}`)
    console.error(`   使用方式: npm run photos:process -- --dir /path/to/photos`)
    process.exit(1)
  }

  const imageFiles = await globby(
    IMAGE_EXTENSIONS.map(e => `**/*.${e}`),
    { cwd: PHOTOS_DIR, absolute: true, caseSensitiveMatch: false }
  )

  if (imageFiles.length === 0) {
    console.log('⚠️  目錄中沒有找到圖片')
    process.exit(0)
  }

  console.log(`找到 ${imageFiles.length} 張照片\n`)

  let uploaded = 0, skipped = 0, errors = 0

  for (const file of imageFiles) {
    try {
      const result = await processPhoto(file)
      if (result?.skipped) skipped++
      else if (result) uploaded++
    } catch (err) {
      console.error(`  ❌ 失敗: ${path.basename(file)} — ${err.message}`)
      errors++
    }
  }

  console.log(`\n${'='.repeat(50)}`)
  console.log(`✨ 完成！上傳 ${uploaded} 張，跳過 ${skipped} 張，失敗 ${errors} 張`)
  console.log(`\n照片 CDN 前綴: ${R2_BASE_URL}/${PHOTOS_PREFIX}/`)

  if (errors > 0) process.exit(1)
}

main().catch(err => {
  console.error('❌ 嚴重錯誤:', err)
  process.exit(1)
})
