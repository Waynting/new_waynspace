import type { PhotoExif } from '@/types/photos';

interface PhotoExifTableProps {
  exif: PhotoExif;
}

export default function PhotoExifTable({ exif }: PhotoExifTableProps) {
  const specs = [
    exif.camera,
    exif.lens,
  ].filter(Boolean);

  const settings = [
    exif.aperture,
    exif.shutterSpeed,
    exif.iso ? `ISO ${exif.iso}` : null,
    exif.focalLength,
  ].filter(Boolean);

  if (specs.length === 0 && settings.length === 0) return null;

  return (
    <div>
      {specs.length > 0 && (
        <p className="text-sm text-foreground">
          {specs.join(' · ')}
        </p>
      )}
      {settings.length > 0 && (
        <p className="text-sm text-muted-foreground mt-1">
          {settings.join(' · ')}
        </p>
      )}
    </div>
  );
}
