#!/usr/bin/env node
/**
 * 修復照片 ID 和日期
 *
 * 1. 從檔名提取真實日期（IMG_YYYYMMDD_HHMMSS, LIU_XXXX 等）
 * 2. 清理 ID（移除前導底線、統一格式）
 * 3. 在 R2 上 rename（copy → delete）
 * 4. 更新索引
 * 5. 刪除舊的 personal-photos/ prefix
 *
 * Usage:
 *   node scripts/fix-photo-ids.mjs --dry-run
 *   node scripts/fix-photo-ids.mjs
 *   node scripts/fix-photo-ids.mjs --delete-old   (also deletes personal-photos/)
 */

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import dotenv from 'dotenv'

dotenv.config()

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const DELETE_OLD = args.includes('--delete-old')

const R2_BUCKET = process.env.R2_BUCKET || 'blog-post'
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const PORTFOLIO_PREFIX = 'portfolio'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

// ── Helpers ──

async function fetchJson(key) {
  try {
    const resp = await s3.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    const body = await resp.Body?.transformToString()
    return body ? JSON.parse(body) : null
  } catch {
    return null
  }
}

async function uploadJson(key, data) {
  if (DRY_RUN) {
    console.log(`  [DRY RUN] upload JSON: ${key}`)
    return
  }
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: JSON.stringify(data, null, 2),
    ContentType: 'application/json',
  }))
}

async function copyObject(from, to) {
  if (DRY_RUN) return
  try {
    await s3.send(new CopyObjectCommand({
      Bucket: R2_BUCKET,
      CopySource: `${R2_BUCKET}/${from}`,
      Key: to,
    }))
  } catch (err) {
    if (err.Code === 'NoSuchKey' || err.name === 'NoSuchKey') {
      // Already moved or doesn't exist — skip
      return
    }
    throw err
  }
}

async function deleteObject(key) {
  if (DRY_RUN) return
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }))
  } catch {
    // Ignore delete errors (already deleted)
  }
}

async function listPrefix(prefix) {
  const keys = []
  let token
  do {
    const resp = await s3.send(new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: prefix,
      ContinuationToken: token,
    }))
    if (resp.Contents) {
      for (const obj of resp.Contents) {
        if (obj.Key) keys.push(obj.Key)
      }
    }
    token = resp.NextContinuationToken
  } while (token)
  return keys
}

// ── Date Extraction from Filename ──

function extractDateFromId(oldId) {
  // Remove the migration date prefix (20260328-)
  const name = oldId.replace(/^20260328-/, '')

  // Pattern: img_YYYYMMDD_HHMMSS
  const imgMatch = name.match(/img_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/)
  if (imgMatch) {
    const [, y, m, d, hh, mm, ss] = imgMatch
    return {
      date: `${y}${m}${d}`,
      iso: `${y}-${m}-${d}T${hh}:${mm}:${ss}.000Z`,
    }
  }

  // Pattern: YYMMDD (like 1130314 → 2024-03-14, ROC year 113)
  const rocMatch = name.match(/^1(\d{2})(\d{2})(\d{2})$/)
  if (rocMatch) {
    const [, yy, mm, dd] = rocMatch
    const year = 1911 + parseInt(`1${yy}`, 10)
    return {
      date: `${year}${mm}${dd}`,
      iso: `${year}-${mm}-${dd}T00:00:00.000Z`,
    }
  }

  // Pattern: DSC_XXXX — no date info, keep unknown
  // Pattern: LIU_XXXX or _LIU_XXXX — no date info
  // Pattern: 00XX_YY_0 — no date info
  // Pattern: numbers only like 1759839801853 — timestamp?
  const tsMatch = name.match(/^(\d{13})$/)
  if (tsMatch) {
    const ts = parseInt(tsMatch[1], 10)
    const d = new Date(ts)
    if (d.getFullYear() >= 2020 && d.getFullYear() <= 2030) {
      const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '')
      return {
        date: dateStr,
        iso: d.toISOString(),
      }
    }
  }

  return null
}

function cleanId(oldId) {
  // Remove migration date prefix
  const name = oldId.replace(/^20260328-/, '')

  // Extract real date
  const dateInfo = extractDateFromId(oldId)

  // Clean the name part
  let cleanName = name
    // For img_YYYYMMDD_HHMMSS, extract just the time part (date goes in prefix)
    .replace(/^img_\d{8}_(\d{6})(_\d+)?$/, '$1')
    // Remove leading underscores
    .replace(/^_+/, '')
    // Replace all underscores with hyphens
    .replace(/_+/g, '-')
    // Normalize
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  const datePrefix = dateInfo ? dateInfo.date : '00000000'

  return `${datePrefix}-${cleanName}`
}

// ── Main ──

async function main() {
  console.log('Fix Photo IDs')
  console.log('==============')
  console.log(`  Dry run: ${DRY_RUN}`)
  console.log(`  Delete old: ${DELETE_OLD}\n`)

  // Load current index
  const index = await fetchJson(`${PORTFOLIO_PREFIX}/_meta/photos.json`)
  if (!index || !index.photos.length) {
    console.log('No photos found in index')
    return
  }

  console.log(`Found ${index.photos.length} photos to process\n`)

  const renames = [] // { oldId, newId, newDateTaken }
  const idMap = new Map() // oldId → newId (for album updates)

  for (const photo of index.photos) {
    const oldId = photo.id
    const newId = cleanId(oldId)
    const dateInfo = extractDateFromId(oldId)

    if (oldId !== newId) {
      renames.push({
        oldId,
        newId,
        newDateTaken: dateInfo?.iso || photo.dateTaken,
      })
      idMap.set(oldId, newId)
      console.log(`  ${oldId}  →  ${newId}`)
      if (dateInfo) {
        console.log(`    date: ${dateInfo.iso}`)
      }
    } else {
      idMap.set(oldId, oldId) // unchanged
    }
  }

  console.log(`\n${renames.length} photos need renaming out of ${index.photos.length}`)

  if (renames.length === 0 && !DELETE_OLD) {
    console.log('Nothing to do')
    return
  }

  // Rename R2 objects
  if (renames.length > 0) {
    console.log('\nRenaming R2 objects...')

    for (let i = 0; i < renames.length; i++) {
      const { oldId, newId } = renames[i]
      const oldPrefix = `${PORTFOLIO_PREFIX}/photos/${oldId}/`
      const newPrefix = `${PORTFOLIO_PREFIX}/photos/${newId}/`

      // List all files under old prefix
      const files = await listPrefix(oldPrefix)

      for (const file of files) {
        const newKey = file.replace(oldPrefix, newPrefix)
        if (DRY_RUN) {
          console.log(`  [DRY RUN] ${file} → ${newKey}`)
        } else {
          await copyObject(file, newKey)
          await deleteObject(file)
        }
      }

      if ((i + 1) % 10 === 0) {
        console.log(`  Progress: ${i + 1}/${renames.length}`)
      }
    }

    console.log(`  Done renaming ${renames.length} photos`)
  }

  // Update photos index
  console.log('\nUpdating photos index...')
  for (const photo of index.photos) {
    const rename = renames.find(r => r.oldId === photo.id)
    if (rename) {
      photo.id = rename.newId
      photo.dateTaken = rename.newDateTaken
      // Also clean up title
      photo.title = photo.title
        .replace(/^[\s_]+/, '')
        .replace(/_/g, ' ')
        .trim()
    }
  }

  // Re-sort by dateTaken
  index.photos.sort(
    (a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime()
  )
  index.updatedAt = new Date().toISOString()

  await uploadJson(`${PORTFOLIO_PREFIX}/_meta/photos.json`, index)
  console.log('  photos.json updated')

  // Update albums index
  const albumsIndex = await fetchJson(`${PORTFOLIO_PREFIX}/_meta/albums.json`)
  if (albumsIndex && albumsIndex.albums) {
    for (const album of albumsIndex.albums) {
      album.photoIds = album.photoIds.map(id => idMap.get(id) || id)
      if (album.coverPhotoId) {
        album.coverPhotoId = idMap.get(album.coverPhotoId) || album.coverPhotoId
      }
    }
    albumsIndex.updatedAt = new Date().toISOString()
    await uploadJson(`${PORTFOLIO_PREFIX}/_meta/albums.json`, albumsIndex)
    console.log('  albums.json updated')
  }

  // Update per-photo meta.json files
  console.log('\nUpdating per-photo meta.json...')
  for (const rename of renames) {
    const metaKey = `${PORTFOLIO_PREFIX}/photos/${rename.newId}/meta.json`
    const meta = await fetchJson(metaKey)
    if (meta) {
      meta.id = rename.newId
      meta.dateTaken = rename.newDateTaken
      meta.title = (meta.title || '')
        .replace(/^[\s_]+/, '')
        .replace(/_/g, ' ')
        .trim()
      await uploadJson(metaKey, meta)
    }
  }
  console.log('  Done')

  // Delete old personal-photos/
  if (DELETE_OLD) {
    console.log('\nDeleting old personal-photos/ prefix...')
    const oldKeys = await listPrefix('personal-photos/')
    console.log(`  Found ${oldKeys.length} objects to delete`)

    for (let i = 0; i < oldKeys.length; i++) {
      if (DRY_RUN) {
        console.log(`  [DRY RUN] delete: ${oldKeys[i]}`)
      } else {
        await deleteObject(oldKeys[i])
      }
      if ((i + 1) % 20 === 0) {
        console.log(`  Progress: ${i + 1}/${oldKeys.length}`)
      }
    }
    console.log(`  Deleted ${oldKeys.length} objects`)
  }

  console.log('\n==============')
  console.log('Done!')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
