import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AdminPhotosClient from './AdminPhotosClient';
import { getPortfolioIndex, getAlbums } from '@/lib/portfolio';

export const metadata: Metadata = {
  title: 'Admin — Photos',
  robots: 'noindex',
};

export const dynamic = 'force-dynamic';

export default async function AdminPhotosPage() {
  // Dev-only gate
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const [{ photos }, albums] = await Promise.all([
    getPortfolioIndex(),
    getAlbums(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <header className="mb-10">
        <p className="text-xs text-muted-foreground font-medium tracking-[0.2em] uppercase mb-2">
          Admin
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Photo Manager</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {photos.length} photos · {albums.length} albums
        </p>
      </header>

      <AdminPhotosClient photos={photos} albums={albums} />
    </div>
  );
}
