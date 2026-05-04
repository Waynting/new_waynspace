import type { Photo } from '@/types/photos';

export function formatDateLabel(input: Date | string = new Date()): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export function buildPhotoCover(p: Photo): {
  src: string;
  meta: { id: string; exif: string };
} {
  const taken = p.dateTaken ? formatDateLabel(p.dateTaken) : null;
  const exifBits = [p.exif?.focalLength, p.exif?.aperture, p.exif?.shutterSpeed].filter(Boolean);
  return {
    src: p.urls.thumb,
    meta: {
      id: p.location?.name || taken || p.id,
      exif: exifBits.join(' · ') || taken || '—',
    },
  };
}
