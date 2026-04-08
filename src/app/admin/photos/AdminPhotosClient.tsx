'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Photo, Album } from '@/types/photos';

interface AdminPhotosClientProps {
  photos: Photo[];
  albums: Album[];
}

export default function AdminPhotosClient({
  photos: initialPhotos,
  albums,
}: AdminPhotosClientProps) {
  const [photos] = useState(initialPhotos);
  const [filter, setFilter] = useState<'all' | string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editFeatured, setEditFeatured] = useState(false);

  const filtered = filter === 'all'
    ? photos
    : photos.filter((p) => p.albumSlugs.includes(filter));

  const startEdit = (photo: Photo) => {
    setEditingId(photo.id);
    setEditTitle(photo.title);
    setEditDescription(photo.description || '');
    setEditTags(photo.tags.join(', '));
    setEditFeatured(photo.featured || false);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/photos/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription || undefined,
          tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
          featured: editFeatured,
        }),
      });
      // Revalidate cache
      await fetch('/api/admin/revalidate', { method: 'POST' });
      setEditingId(null);
      // Refresh would be ideal but for dev-only this is fine
      window.location.reload();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const deletePhoto = async (id: string) => {
    if (!confirm(`Delete photo ${id}?`)) return;
    try {
      await fetch(`/api/admin/photos/${id}`, { method: 'DELETE' });
      await fetch('/api/admin/revalidate', { method: 'POST' });
      window.location.reload();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div>
      {/* Nav */}
      <div className="flex gap-4 mb-6 text-xs">
        <Link href="/admin/photos/albums" className="text-muted-foreground hover:text-foreground transition-colors">
          Manage Albums →
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-4 mb-8 border-b border-border pb-3 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`text-xs tracking-wide uppercase whitespace-nowrap ${
            filter === 'all'
              ? 'text-foreground font-medium border-b border-foreground'
              : 'text-muted-foreground'
          }`}
        >
          All ({photos.length})
        </button>
        {albums.map((album) => (
          <button
            key={album.slug}
            onClick={() => setFilter(album.slug)}
            className={`text-xs tracking-wide uppercase whitespace-nowrap ${
              filter === album.slug
                ? 'text-foreground font-medium border-b border-foreground'
                : 'text-muted-foreground'
            }`}
          >
            {album.title} ({album.photoCount})
          </button>
        ))}
      </div>

      {/* Photo list */}
      <div className="space-y-2">
        {filtered.map((photo) => (
          <div
            key={photo.id}
            className="flex items-center gap-4 py-3 border-b border-border/50"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 flex-shrink-0 bg-muted overflow-hidden relative">
              <Image
                src={photo.urls.thumb}
                alt={photo.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>

            {/* Info */}
            {editingId === photo.id ? (
              <div className="flex-1 space-y-2">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-sm bg-muted px-2 py-1 border border-border"
                  placeholder="Title"
                />
                <input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-xs bg-muted px-2 py-1 border border-border"
                  placeholder="Description"
                />
                <input
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full text-xs bg-muted px-2 py-1 border border-border"
                  placeholder="Tags (comma-separated)"
                />
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={editFeatured}
                    onChange={(e) => setEditFeatured(e.target.checked)}
                  />
                  Featured
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="text-xs px-3 py-1 bg-foreground text-background"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs px-3 py-1 text-muted-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{photo.title}</p>
                <p className="text-xs text-muted-foreground">
                  {photo.id}
                  {photo.location?.name && ` · ${photo.location.name}`}
                  {photo.featured && ' · ★ Featured'}
                </p>
                {photo.tags.length > 0 && (
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    {photo.tags.join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            {editingId !== photo.id && (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => startEdit(photo)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
