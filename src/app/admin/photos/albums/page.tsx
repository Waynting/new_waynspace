import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AdminAlbumsClient from './AdminAlbumsClient';
import { getAlbums, getPortfolioIndex } from '@/lib/portfolio';

export const metadata: Metadata = {
  title: 'Admin — Albums',
  robots: 'noindex',
};

export const dynamic = 'force-dynamic';

export default async function AdminAlbumsPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const [albums, { photos }] = await Promise.all([
    getAlbums(),
    getPortfolioIndex(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <header className="mb-10">
        <p className="text-xs text-muted-foreground font-medium tracking-[0.2em] uppercase mb-2">
          Admin
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Album Manager</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {albums.length} albums · {photos.length} photos total
        </p>
      </header>

      <AdminAlbumsClient albums={albums} allPhotos={photos} />
    </div>
  );
}
