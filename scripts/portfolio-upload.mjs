#!/usr/bin/env node
/**
 * Portfolio 照片上傳腳本
 *
 * 功能：
 * 1. 掃描本地照片目錄
 * 2. 提取 EXIF 資訊
 * 3. 生成三個尺寸 (original 2400px / display 1600px / thumb 600px)
 * 4. 上傳到 R2 portfolio/photos/{id}/ 結構
 * 5. 更新集中式 JSON 索引
 *
 * 使用方式：
 *   npm run portfolio:upload -- --dir /path/to/photos
 *   npm run portfolio:upload -- --dir ./photos --album taipei-2025 --location "Taipei, Taiwan" --tags street,night
 *   npm run portfolio:upload -- --dir ./photos --dry-run
 */

import sharp from 'sharp'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { globby } from 'globby'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ── Parse CLI Args ──

const args = process.argv.slice(2)
function getArg(name) {
  const idx = args.indexOf(`--${name}`)
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null
}
const hasFlag = (name) => args.includes(`--${name}`)

const PHOTOS_DIR = getArg('dir')
  ? path.resolve(getArg('dir'))
  : path.resolve(__dirname, '../local-photos')
const ALBUM_SLUG = getArg('album')
const LOCATION_STR = getArg('location')
const TAGS_STR = getArg('tags')
const DRY_RUN = hasFlag('dry-run')

// ── R2 Config ──

const R2_BASE_URL = process.env.R2_BASE_URL || 'https://img.waynspace.com'
const R2_BUCKET = process.env.R2_BUCKET || 'blog-post'
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const PORTFOLIO_PREFIX = 'portfolio'

if (!DRY_RUN && (!CF_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY)) {
  console.error('Missing R2 credentials: CF_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY')
  process.exit(1)
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
})

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'tiff', 'avif', 'arw', 'cr2', 'nef', 'dng']

// ── Size Configs ──

const SIZES = [
  { name: 'original', maxWidth: 2400, quality: 82 },
  { name: 'display', maxWidth: 1600, quality: 78 },
  { name: 'thumb', maxWidth: 600, quality: 72 },
]

// ── EXIF Extraction ──

async function extractExif(buffer) {
  const metadata = await sharp(buffer).metadata()
  const result = {
    width: metadata.width || 0,
    height: metadata.height || 0,
    exif: {},
  }

  if (!metadata.exif) return result

  try {
    // Dynamic import for exif-reader (optional dependency)
    let exifReader
    try {
      exifReader = (await import('exif-reader')).default || (await import('exif-reader'))
    } catch {
      console.log('  exif-reader not installed, skipping EXIF extraction')
      return result
    }

    const parsed = exifReader(metadata.exif)

    result.exif = {
      camera: [parsed?.image?.Make, parsed?.image?.Model]
        .filter(Boolean)
        .join(' ')
        .trim() || undefined,
      lens: parsed?.exif?.LensModel || undefined,
      focalLength: parsed?.exif?.FocalLength
        ? `${parsed.exif.FocalLength}mm`
        : undefined,
      aperture: parsed?.exif?.FNumber
        ? `f/${parsed.exif.FNumber}`
        : undefined,
      shutterSpeed: parsed?.exif?.ExposureTime
        ? formatShutterSpeed(parsed.exif.ExposureTime)
        : undefined,
      iso: parsed?.exif?.ISO || undefined,
      dateTimeOriginal: parsed?.exif?.DateTimeOriginal
        ? new Date(parsed.exif.DateTimeOriginal).toISOString()
        : undefined,
    }

    // GPS
    if (parsed?.gps?.GPSLatitude && parsed?.gps?.GPSLongitude) {
      result.coordinates = {
        lat: dmsToDecimal(parsed.gps.GPSLatitude, parsed.gps.GPSLatitudeRef),
        lng: dmsToDecimal(parsed.gps.GPSLongitude, parsed.gps.GPSLongitudeRef),
      }
    }
  } catch (err) {
    console.log(`  EXIF parse warning: ${err.message}`)
  }

  return result
}

function formatShutterSpeed(seconds) {
  if (seconds >= 1) return `${seconds}s`
  return `1/${Math.round(1 / seconds)}s`
}

function dmsToDecimal(dms, ref) {
  if (!Array.isArray(dms) || dms.length < 3) return 0
  let decimal = dms[0] + dms[1] / 60 + dms[2] / 3600
  if (ref === 'S' || ref === 'W') decimal *= -1
  return decimal
}

// ── Photo ID Generation ──

function generatePhotoId(filename, exifDate) {
  const date = exifDate
    ? new Date(exifDate)
    : new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')

  const cleanName = path.basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)

  return `${dateStr}-${cleanName}`
}

// ── R2 Operations ──

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
  const body = JSON.stringify(data, null, 2)
  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would upload JSON: ${key}`)
    return
  }
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: 'application/json',
  }))
}

// ── Process Single Photo ──

async function processPhoto(localPath) {
  const filename = path.basename(localPath)
  console.log(`\n  Processing: ${filename}`)

  const imageBuffer = await fs.readFile(localPath)
  const originalSize = imageBuffer.length

  // Extract EXIF
  const { width, height, exif, coordinates } = await extractExif(imageBuffer)
  const aspectRatio = width && height ? +(width / height).toFixed(4) : 1.5

  // Generate photo ID
  const id = generatePhotoId(filename, exif.dateTimeOriginal)
  const prefix = `${PORTFOLIO_PREFIX}/photos/${id}`

  // Generate & upload 3 sizes
  for (const size of SIZES) {
    const webpBuffer = await sharp(imageBuffer)
      .rotate()
      .resize({ width: size.maxWidth, withoutEnlargement: true })
      .webp({ quality: size.quality })
      .toBuffer()

    await uploadBuffer(`${prefix}/${size.name}.webp`, webpBuffer)
    console.log(`    ${size.name}: ${(webpBuffer.length / 1024).toFixed(0)} KB (${size.maxWidth}px)`)
  }

  // Build metadata
  const location = LOCATION_STR
    ? { name: LOCATION_STR }
    : undefined

  const tags = TAGS_STR
    ? TAGS_STR.split(',').map(t => t.trim()).filter(Boolean)
    : []

  const meta = {
    id,
    title: path.basename(filename, path.extname(filename)).replace(/[-_]/g, ' '),
    dateTaken: exif.dateTimeOriginal || new Date().toISOString(),
    dateUploaded: new Date().toISOString(),
    location: coordinates
      ? { ...location, coordinates }
      : location,
    exif: Object.keys(exif).length > 0 ? exif : undefined,
    tags,
    albumSlugs: ALBUM_SLUG ? [ALBUM_SLUG] : [],
    aspectRatio,
  }

  // Upload per-photo metadata
  await uploadJson(`${prefix}/meta.json`, meta)

  console.log(`    ${(originalSize / 1024 / 1024).toFixed(2)} MB original, ID: ${id}`)

  return meta
}

// ── Update Indexes ──

async function updateIndexes(newPhotos) {
  console.log('\nUpdating indexes...')

  // Photos index
  const photosIndex = (await fetchJson(`${PORTFOLIO_PREFIX}/_meta/photos.json`)) || {
    photos: [],
    updatedAt: new Date().toISOString(),
  }

  const existingIds = new Set(photosIndex.photos.map(p => p.id))
  for (const photo of newPhotos) {
    if (!existingIds.has(photo.id)) {
      photosIndex.photos.push(photo)
    }
  }
  photosIndex.updatedAt = new Date().toISOString()

  // Sort by dateTaken descending
  photosIndex.photos.sort(
    (a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime()
  )

  await uploadJson(`${PORTFOLIO_PREFIX}/_meta/photos.json`, photosIndex)
  console.log(`  photos.json: ${photosIndex.photos.length} total photos`)

  // Albums index (update if album specified)
  if (ALBUM_SLUG) {
    const albumsIndex = (await fetchJson(`${PORTFOLIO_PREFIX}/_meta/albums.json`)) || {
      albums: [],
      updatedAt: new Date().toISOString(),
    }

    let album = albumsIndex.albums.find(a => a.slug === ALBUM_SLUG)
    if (!album) {
      album = {
        slug: ALBUM_SLUG,
        title: ALBUM_SLUG.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        dateCreated: new Date().toISOString(),
        photoIds: [],
        tags: [],
        published: true,
      }
      if (LOCATION_STR) album.location = { name: LOCATION_STR }
      albumsIndex.albums.push(album)
    }

    const existingPhotoIds = new Set(album.photoIds)
    for (const photo of newPhotos) {
      if (!existingPhotoIds.has(photo.id)) {
        album.photoIds.push(photo.id)
      }
    }
    albumsIndex.updatedAt = new Date().toISOString()

    await uploadJson(`${PORTFOLIO_PREFIX}/_meta/albums.json`, albumsIndex)
    console.log(`  albums.json: album "${ALBUM_SLUG}" now has ${album.photoIds.length} photos`)
  }
}

// ── Main ──

async function main() {
  console.log('Portfolio Upload')
  console.log('================')
  console.log(`  Source: ${PHOTOS_DIR}`)
  console.log(`  Album: ${ALBUM_SLUG || '(none)'}`)
  console.log(`  Location: ${LOCATION_STR || '(none)'}`)
  console.log(`  Tags: ${TAGS_STR || '(none)'}`)
  console.log(`  Dry run: ${DRY_RUN}`)

  try {
    await fs.access(PHOTOS_DIR)
  } catch {
    console.error(`\nDirectory not found: ${PHOTOS_DIR}`)
    console.error('Usage: npm run portfolio:upload -- --dir /path/to/photos')
    process.exit(1)
  }

  const imageFiles = await globby(
    IMAGE_EXTENSIONS.map(e => `**/*.${e}`),
    { cwd: PHOTOS_DIR, absolute: true, caseSensitiveMatch: false }
  )

  if (imageFiles.length === 0) {
    console.log('\nNo images found in directory')
    process.exit(0)
  }

  console.log(`\nFound ${imageFiles.length} images\n`)

  const results = []
  let errors = 0

  // Process sequentially (sharp is already parallel internally)
  for (const file of imageFiles) {
    try {
      const meta = await processPhoto(file)
      if (meta) results.push(meta)
    } catch (err) {
      console.error(`  FAILED: ${path.basename(file)} — ${err.message}`)
      errors++
    }
  }

  // Update indexes
  if (results.length > 0) {
    await updateIndexes(results)
  }

  console.log('\n================')
  console.log(`Done! Uploaded: ${results.length}, Errors: ${errors}`)

  if (errors > 0) process.exit(1)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
