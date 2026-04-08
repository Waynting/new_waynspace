import { unstable_cache } from 'next/cache';
import { s3Client, R2_BUCKET, R2_BASE_URL, fetchJson } from '@/lib/r2';
import type {
  Photo,
  PhotoMeta,
  Album,
  AlbumMeta,
  PortfolioIndex,
  AlbumsIndex,
} from '@/types/photos';

const PORTFOLIO_PREFIX = 'portfolio';

// ── Helpers ──

function photoUrls(id: string) {
  const base = `${R2_BASE_URL}/${PORTFOLIO_PREFIX}/photos/${id}`;
  return {
    original: `${base}/original.webp`,
    display: `${base}/display.webp`,
    thumb: `${base}/thumb.webp`,
  };
}

function albumCoverUrl(album: AlbumMeta, photosIndex: PhotoMeta[]): string {
  if (album.coverPhotoId) {
    return `${R2_BASE_URL}/${PORTFOLIO_PREFIX}/photos/${album.coverPhotoId}/display.webp`;
  }
  const firstId = album.photoIds[0];
  if (firstId) {
    return `${R2_BASE_URL}/${PORTFOLIO_PREFIX}/photos/${firstId}/display.webp`;
  }
  return `${R2_BASE_URL}/${PORTFOLIO_PREFIX}/albums/${album.slug}/cover.webp`;
}

// ── Core Fetchers ──

async function fetchPortfolioIndex(): Promise<PortfolioIndex> {
  const index = await fetchJson<PortfolioIndex>(
    `${PORTFOLIO_PREFIX}/_meta/photos.json`
  );
  return index || { photos: [], updatedAt: new Date().toISOString() };
}

async function fetchAlbumsIndex(): Promise<AlbumsIndex> {
  const index = await fetchJson<AlbumsIndex>(
    `${PORTFOLIO_PREFIX}/_meta/albums.json`
  );
  return index || { albums: [], updatedAt: new Date().toISOString() };
}

// ── Single cached fetch — all derived functions use this ──

export const getPortfolioIndex = unstable_cache(
  async () => {
    const [photosIndex, albumsIndex] = await Promise.all([
      fetchPortfolioIndex(),
      fetchAlbumsIndex(),
    ]);

    const photos: Photo[] = photosIndex.photos.map((meta) => ({
      ...meta,
      urls: photoUrls(meta.id),
    }));

    const albums: Album[] = albumsIndex.albums
      .filter((a) => a.published)
      .map((meta) => ({
        ...meta,
        coverUrl: albumCoverUrl(meta, photosIndex.photos),
        photoCount: meta.photoIds.length,
      }));

    return { photos, albums };
  },
  ['portfolio-index'],
  { revalidate: 3600, tags: ['portfolio'] }
);

// ── Derived functions (no extra caching — getPortfolioIndex is already cached) ──

export async function getAlbums(): Promise<Album[]> {
  const { albums } = await getPortfolioIndex();
  return albums.sort(
    (a, b) =>
      new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
  );
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  const { albums } = await getPortfolioIndex();
  return albums.find((a) => a.slug === slug) || null;
}

export async function getAlbumPhotos(slug: string): Promise<Photo[]> {
  const { photos, albums } = await getPortfolioIndex();
  const album = albums.find((a) => a.slug === slug);
  if (!album) return [];
  const photoMap = new Map(photos.map((p) => [p.id, p]));
  return album.photoIds
    .map((id) => photoMap.get(id))
    .filter((p): p is Photo => !!p);
}

export async function getPhotoById(id: string): Promise<Photo | null> {
  const { photos } = await getPortfolioIndex();
  return photos.find((p) => p.id === id) || null;
}

export async function getFeaturedPhotos(): Promise<Photo[]> {
  const { photos } = await getPortfolioIndex();
  const featured = photos.filter((p) => p.featured);
  if (featured.length > 0) return featured.slice(0, 5);
  return [...photos]
    .sort(
      (a, b) =>
        new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime()
    )
    .slice(0, 5);
}

export async function getPhotosByTag(tag: string): Promise<Photo[]> {
  const { photos } = await getPortfolioIndex();
  return photos.filter((p) => p.tags.includes(tag));
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const { photos } = await getPortfolioIndex();
  const tagMap = new Map<string, number>();
  for (const photo of photos) {
    for (const tag of photo.tags) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    }
  }
  return [...tagMap.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getRecentPhotos(limit = 12): Promise<Photo[]> {
  const { photos } = await getPortfolioIndex();
  return [...photos]
    .sort(
      (a, b) =>
        new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime()
    )
    .slice(0, limit);
}
