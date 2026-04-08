#!/usr/bin/env node
/**
 * 照片遷移腳本：personal-photos/ → portfolio/photos/
 *
 * 從現有的 R2 personal-photos/ 前綴遷移照片到新的 portfolio/ 結構。
 * 每張照片會：
 * 1. 從 R2 下載
 * 2. 生成 3 個尺寸 (original/display/thumb)
 * 3. 上傳到 portfolio/photos/{id}/ 結構
 * 4. 建立 metadata JSON
 * 5. 更新集中式索引
 *
 * 使用方式：
 *   node scripts/migrate-photos.mjs
 *   node scripts/migrate-photos.mjs --dry-run
 *   node scripts/migrate-photos.mjs --album uncategorized
 */

import sharp from 'sharp'
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const ALBUM_SLUG = (() => {
  const idx = args.indexOf('--album')
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null
})()

const R2_BASE_URL = process.env.R2_BASE_URL || 'https://img.waynspace.com'
const R2_BUCKET = process.env.R2_BUCKET || 'blog-post'
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY

const OLD_PREFIX = 'personal-photos/'
const NEW_PREFIX = 'portfolio'
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']

if (!CF_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('Missing R2 credentials')
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

const SIZES = [
  { name: 'original', maxWidth: 2400, quality: 82 },
  { name: 'display', maxWidth: 1600, quality: 78 },
  { name: 'thumb', maxWidth: 600, quality: 72 },
]

// ── Helpers ──

async function fetchJson(key) {
  try {
    const response = await s3.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    const body = await response.Body?.transformToString()
    return body ? JSON.parse(body) : null
  } catch {
    return null
  }
}

async function uploadBuffer(key, buffer, contentType = 'image/webp') {
  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would upload: ${key} (${(buffer.length / 1024).toFixed(0)} KB)`)
    return
  }
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }))
}

async function uploadJson(key, data) {
  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would upload JSON: ${key}`)
    return
  }
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: JSON.stringify(data, null, 2),
    ContentType: 'application/json',
  }))
}

// ── List existing photos ──

async function listOldPhotos() {
  const photos = []
  let continuationToken

  do {
    const response = await s3.send(new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: OLD_PREFIX,
      ContinuationToken: continuationToken,
    }))

    if (response.Contents) {
      for (const obj of response.Contents) {
        if (!obj.Key) continue
        const ext = path.extname(obj.Key).toLowerCase()
        if (!IMAGE_EXTENSIONS.includes(ext)) continue
        photos.push({
          key: obj.Key,
          size: obj.Size || 0,
          lastModified: obj.LastModified?.toISOString() || new Date().toISOString(),
        })
      }
    }

    continuationToken = response.NextContinuationToken
  } while (continuationToken)

  return photos
}

// ── Migrate single photo ──

async function migratePhoto(oldPhoto, index) {
  const filename = path.basename(oldPhoto.key, path.extname(oldPhoto.key))
  console.log(`\n[${index + 1}] Migrating: ${oldPhoto.key}`)

  // Download from R2
  const response = await s3.send(new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: oldPhoto.key,
  }))
  const chunks = []
  for await (const chunk of response.Body) {
    chunks.push(chunk)
  }
  const imageBuffer = Buffer.concat(chunks)

  // Get dimensions
  const metadata = await sharp(imageBuffer).metadata()
  const width = metadata.width || 0
  const height = metadata.height || 0
  const aspectRatio = width && height ? +(width / height).toFixed(4) : 1.5

  // Try EXIF extraction
  let exifData = {}
  if (metadata.exif) {
    try {
      let exifReader
      try {
        exifReader = (await import('exif-reader')).default || (await import('exif-reader'))
      } catch {
        // exif-reader not available
      }
      if (exifReader) {
        const parsed = exifReader(metadata.exif)
        exifData = {
          camera: [parsed?.image?.Make, parsed?.image?.Model]
            .filter(Boolean).join(' ').trim() || undefined,
          lens: parsed?.exif?.LensModel || undefined,
          focalLength: parsed?.exif?.FocalLength ? `${parsed.exif.FocalLength}mm` : undefined,
          aperture: parsed?.exif?.FNumber ? `f/${parsed.exif.FNumber}` : undefined,
          shutterSpeed: parsed?.exif?.ExposureTime
            ? (parsed.exif.ExposureTime >= 1 ? `${parsed.exif.ExposureTime}s` : `1/${Math.round(1 / parsed.exif.ExposureTime)}s`)
            : undefined,
          iso: parsed?.exif?.ISO || undefined,
          dateTimeOriginal: parsed?.exif?.DateTimeOriginal
            ? new Date(parsed.exif.DateTimeOriginal).toISOString()
            : undefined,
        }
      }
    } catch {
      // EXIF parsing failed silently
    }
  }

  // Generate photo ID
  const dateStr = exifData.dateTimeOriginal
    ? new Date(exifData.dateTimeOriginal).toISOString().slice(0, 10).replace(/-/g, '')
    : oldPhoto.lastModified
      ? new Date(oldPhoto.lastModified).toISOString().slice(0, 10).replace(/-/g, '')
      : '00000000'

  const cleanName = filename
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)

  const id = `${dateStr}-${cleanName}`
  const prefix = `${NEW_PREFIX}/photos/${id}`

  // Generate & upload 3 sizes
  for (const size of SIZES) {
    const webpBuffer = await sharp(imageBuffer)
      .rotate()
      .resize({ width: size.maxWidth, withoutEnlargement: true })
      .webp({ quality: size.quality })
      .toBuffer()

    await uploadBuffer(`${prefix}/${size.name}.webp`, webpBuffer)
    console.log(`  ${size.name}: ${(webpBuffer.length / 1024).toFixed(0)} KB`)
  }

  // Build metadata
  const meta = {
    id,
    title: filename.replace(/[-_]/g, ' '),
    dateTaken: exifData.dateTimeOriginal || oldPhoto.lastModified || new Date().toISOString(),
    dateUploaded: new Date().toISOString(),
    exif: Object.values(exifData).some(Boolean) ? exifData : undefined,
    tags: [],
    albumSlugs: ALBUM_SLUG ? [ALBUM_SLUG] : [],
    aspectRatio,
  }

  await uploadJson(`${prefix}/meta.json`, meta)
  console.log(`  ID: ${id} | ${width}x${height} | ratio: ${aspectRatio}`)

  return meta
}

// ── Main ──

async function main() {
  console.log('Portfolio Migration')
  console.log('===================')
  console.log(`  From: ${OLD_PREFIX}`)
  console.log(`  To: ${NEW_PREFIX}/photos/`)
  console.log(`  Album: ${ALBUM_SLUG || '(none)'}`)
  console.log(`  Dry run: ${DRY_RUN}\n`)

  // List old photos
  const oldPhotos = await listOldPhotos()
  console.log(`Found ${oldPhotos.length} photos to migrate\n`)

  if (oldPhotos.length === 0) {
    console.log('Nothing to migrate')
    return
  }

  const results = []
  let errors = 0

  for (let i = 0; i < oldPhotos.length; i++) {
    try {
      const meta = await migratePhoto(oldPhotos[i], i)
      results.push(meta)
    } catch (err) {
      console.error(`  FAILED: ${oldPhotos[i].key} — ${err.message}`)
      errors++
    }
  }

  // Build indexes
  if (results.length > 0 && !DRY_RUN) {
    console.log('\nBuilding indexes...')

    // Photos index
    const photosIndex = {
      photos: results.sort(
        (a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime()
      ),
      updatedAt: new Date().toISOString(),
    }
    await uploadJson(`${NEW_PREFIX}/_meta/photos.json`, photosIndex)
    console.log(`  photos.json: ${results.length} photos`)

    // Albums index
    if (ALBUM_SLUG) {
      const albumsIndex = {
        albums: [{
          slug: ALBUM_SLUG,
          title: ALBUM_SLUG.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          dateCreated: new Date().toISOString(),
          photoIds: results.map(p => p.id),
          tags: [],
          published: true,
        }],
        updatedAt: new Date().toISOString(),
      }
      await uploadJson(`${NEW_PREFIX}/_meta/albums.json`, albumsIndex)
      console.log(`  albums.json: 1 album with ${results.length} photos`)
    } else {
      // Create empty albums index if none exists
      const existing = await fetchJson(`${NEW_PREFIX}/_meta/albums.json`)
      if (!existing) {
        await uploadJson(`${NEW_PREFIX}/_meta/albums.json`, {
          albums: [],
          updatedAt: new Date().toISOString(),
        })
      }
    }
  }

  console.log('\n===================')
  console.log(`Done! Migrated: ${results.length}, Errors: ${errors}`)

  if (errors > 0) process.exit(1)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
