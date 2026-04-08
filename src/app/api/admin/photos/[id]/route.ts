import { NextRequest, NextResponse } from 'next/server';
import { ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, R2_BUCKET, fetchJson, uploadJson, validateId, devOnly } from '@/lib/r2';

const PORTFOLIO_PREFIX = 'portfolio';

const ALLOWED_PHOTO_FIELDS = ['title', 'description', 'tags', 'featured', 'location', 'albumSlugs'];

function pickFields(obj: Record<string, unknown>, allowed: string[]) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => allowed.includes(k))
  );
}

// PUT — Update photo metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = devOnly();
  if (guard) return guard;

  const { id } = await params;
  const idGuard = validateId(id);
  if (idGuard) return idGuard;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const updates = pickFields(body, ALLOWED_PHOTO_FIELDS);

  // Update per-photo meta.json
  const metaKey = `${PORTFOLIO_PREFIX}/photos/${id}/meta.json`;
  const meta = await fetchJson<Record<string, unknown>>(metaKey);
  if (!meta) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
  }

  const updated = { ...meta, ...updates };
  await uploadJson(metaKey, updated);

  // Update central index
  const indexKey = `${PORTFOLIO_PREFIX}/_meta/photos.json`;
  const index = await fetchJson<{ photos: Record<string, unknown>[]; updatedAt: string }>(indexKey);
  if (index) {
    const photoIdx = index.photos.findIndex((p) => p.id === id);
    if (photoIdx !== -1) {
      index.photos[photoIdx] = { ...index.photos[photoIdx], ...updates };
      index.updatedAt = new Date().toISOString();
      await uploadJson(indexKey, index);
    }
  }

  return NextResponse.json({ ok: true, photo: updated });
}

// DELETE — Delete photo and all its files
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = devOnly();
  if (guard) return guard;

  const { id } = await params;
  const idGuard = validateId(id);
  if (idGuard) return idGuard;

  const prefix = `${PORTFOLIO_PREFIX}/photos/${id}/`;

  // List and delete all objects under this photo's prefix (parallel)
  const listResponse = await s3Client.send(new ListObjectsV2Command({
    Bucket: R2_BUCKET,
    Prefix: prefix,
  }));

  if (listResponse.Contents) {
    await Promise.all(
      listResponse.Contents
        .filter((obj) => obj.Key)
        .map((obj) =>
          s3Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: obj.Key! }))
        )
    );
  }

  // Remove from central index
  const indexKey = `${PORTFOLIO_PREFIX}/_meta/photos.json`;
  const index = await fetchJson<{ photos: Record<string, unknown>[]; updatedAt: string }>(indexKey);
  if (index) {
    index.photos = index.photos.filter((p) => p.id !== id);
    index.updatedAt = new Date().toISOString();
    await uploadJson(indexKey, index);
  }

  // Remove from album indexes
  const albumsKey = `${PORTFOLIO_PREFIX}/_meta/albums.json`;
  const albumsIndex = await fetchJson<{ albums: Array<{ photoIds: string[]; slug: string }>; updatedAt: string }>(albumsKey);
  if (albumsIndex) {
    for (const album of albumsIndex.albums) {
      album.photoIds = album.photoIds.filter((pid) => pid !== id);
    }
    albumsIndex.updatedAt = new Date().toISOString();
    await uploadJson(albumsKey, albumsIndex);
  }

  return NextResponse.json({ ok: true });
}
