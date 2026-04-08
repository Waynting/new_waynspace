import { NextRequest, NextResponse } from 'next/server';
import { fetchJson, uploadJson, validateId, devOnly } from '@/lib/r2';

const ALBUMS_KEY = 'portfolio/_meta/albums.json';

const ALLOWED_ALBUM_FIELDS = ['title', 'description', 'location', 'dateCaptured', 'published', 'coverPhotoId', 'tags'];

function pickFields(obj: Record<string, unknown>, allowed: string[]) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => allowed.includes(k))
  );
}

interface AlbumEntry {
  slug: string;
  title: string;
  description?: string;
  location?: { name: string };
  dateCaptured?: string;
  dateCreated: string;
  coverPhotoId?: string;
  photoIds: string[];
  tags: string[];
  published: boolean;
}

// PUT — Create or update album metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const guard = devOnly();
  if (guard) return guard;

  const { slug } = await params;
  const slugGuard = validateId(slug);
  if (slugGuard) return slugGuard;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const updates = pickFields(body, ALLOWED_ALBUM_FIELDS);

  const index = await fetchJson<{ albums: AlbumEntry[]; updatedAt: string }>(ALBUMS_KEY)
    || { albums: [], updatedAt: new Date().toISOString() };

  const albumIdx = index.albums.findIndex((a) => a.slug === slug);

  if (albumIdx === -1) {
    // Create new album
    const newAlbum: AlbumEntry = {
      slug,
      title: (updates.title as string) || slug,
      description: updates.description as string | undefined,
      location: updates.location as { name: string } | undefined,
      dateCaptured: updates.dateCaptured as string | undefined,
      dateCreated: new Date().toISOString(),
      photoIds: [],
      tags: (updates.tags as string[]) || [],
      published: (updates.published as boolean) ?? true,
    };
    index.albums.push(newAlbum);
    index.updatedAt = new Date().toISOString();
    await uploadJson(ALBUMS_KEY, index);
    return NextResponse.json({ ok: true, album: newAlbum, created: true });
  }

  // Update existing
  index.albums[albumIdx] = { ...index.albums[albumIdx], ...updates };
  index.updatedAt = new Date().toISOString();
  await uploadJson(ALBUMS_KEY, index);

  return NextResponse.json({ ok: true, album: index.albums[albumIdx] });
}

// DELETE — Delete album (photos remain)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const guard = devOnly();
  if (guard) return guard;

  const { slug } = await params;
  const slugGuard = validateId(slug);
  if (slugGuard) return slugGuard;

  const index = await fetchJson<{ albums: AlbumEntry[]; updatedAt: string }>(ALBUMS_KEY);
  if (!index) {
    return NextResponse.json({ error: 'Albums index not found' }, { status: 404 });
  }

  index.albums = index.albums.filter((a) => a.slug !== slug);
  index.updatedAt = new Date().toISOString();
  await uploadJson(ALBUMS_KEY, index);

  // Also remove album slug from photos
  const photosKey = 'portfolio/_meta/photos.json';
  const photosIndex = await fetchJson<{ photos: Array<{ albumSlugs: string[] }>; updatedAt: string }>(photosKey);
  if (photosIndex) {
    for (const photo of photosIndex.photos) {
      photo.albumSlugs = photo.albumSlugs.filter((s) => s !== slug);
    }
    photosIndex.updatedAt = new Date().toISOString();
    await uploadJson(photosKey, photosIndex);
  }

  return NextResponse.json({ ok: true });
}
