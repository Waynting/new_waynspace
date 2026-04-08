import Image from 'next/image';
import Link from 'next/link';
import type { Album } from '@/types/photos';

interface AlbumCardProps {
  album: Album;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link
      href={`/photos/albums/${album.slug}`}
      className="group relative block overflow-hidden bg-muted aspect-[4/3] flex-shrink-0 w-72 sm:w-80"
    >
      <Image
        src={album.coverUrl}
        alt={album.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        sizes="320px"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-white text-sm font-medium">{album.title}</p>
        <p className="text-white/60 text-xs mt-1">
          {album.photoCount} photos
          {album.location?.name && ` · ${album.location.name}`}
        </p>
      </div>
    </Link>
  );
}
