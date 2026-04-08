'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Photo, Album } from '@/types/photos';

interface AdminAlbumsClientProps {
  albums: Album[];
  allPhotos: Photo[];
}

export default function AdminAlbumsClient({
  albums: initialAlbums,
  allPhotos,
}: AdminAlbumsClientProps) {
  const [albums] = useState(initialAlbums);
  const [creating, setCreating] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Create form
  const [newSlug, setNewSlug] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('');

  // Edit form
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDateCaptured, setEditDateCaptured] = useState('');
  const [editPublished, setEditPublished] = useState(true);

  const createAlbum = async () => {
    if (!newSlug || !newTitle) return;
    setSaving(true);
    try {
      // Use the albums API to create — we'll PUT to the new slug
      await fetch(`/api/admin/albums/${newSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: newSlug,
          title: newTitle,
          description: newDescription || undefined,
          location: newLocation ? { name: newLocation } : undefined,
          dateCreated: new Date().toISOString(),
          photoIds: [],
          tags: [],
          published: true,
        }),
      });
      await fetch('/api/admin/revalidate', { method: 'POST' });
      setCreating(false);
      setNewSlug('');
      setNewTitle('');
      setNewDescription('');
      setNewLocation('');
      window.location.reload();
    } catch (err) {
      console.error('Create failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (album: Album) => {
    setEditingSlug(album.slug);
    setEditTitle(album.title);
    setEditDescription(album.description || '');
    setEditLocation(album.location?.name || '');
    setEditDateCaptured(album.dateCaptured || '');
    setEditPublished(album.published);
  };

  const saveEdit = async () => {
    if (!editingSlug) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/albums/${editingSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription || undefined,
          location: editLocation ? { name: editLocation } : undefined,
          dateCaptured: editDateCaptured || undefined,
          published: editPublished,
        }),
      });
      await fetch('/api/admin/revalidate', { method: 'POST' });
      setEditingSlug(null);
      window.location.reload();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const deleteAlbum = async (slug: string) => {
    if (!confirm(`Delete album "${slug}"? Photos will NOT be deleted.`)) return;
    try {
      await fetch(`/api/admin/albums/${slug}`, { method: 'DELETE' });
      await fetch('/api/admin/revalidate', { method: 'POST' });
      window.location.reload();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div>
      {/* Nav */}
      <div className="flex gap-4 mb-8 text-xs">
        <Link href="/admin/photos" className="text-muted-foreground hover:text-foreground transition-colors">
          ← Photos
        </Link>
      </div>

      {/* Create button */}
      {!creating && (
        <button
          onClick={() => setCreating(true)}
          className="text-xs px-4 py-2 bg-foreground text-background mb-8"
        >
          + New Album
        </button>
      )}

      {/* Create form */}
      {creating && (
        <div className="border border-border p-4 mb-8 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide">New Album</p>
          <input
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
            className="w-full text-sm bg-muted px-2 py-1 border border-border"
            placeholder="slug (e.g. taipei-spring-2025)"
          />
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full text-sm bg-muted px-2 py-1 border border-border"
            placeholder="Title (e.g. Taipei, Spring 2025)"
          />
          <input
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full text-xs bg-muted px-2 py-1 border border-border"
            placeholder="Description (optional)"
          />
          <input
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            className="w-full text-xs bg-muted px-2 py-1 border border-border"
            placeholder="Location (e.g. Taipei, Taiwan)"
          />
          <div className="flex gap-2">
            <button
              onClick={createAlbum}
              disabled={saving || !newSlug || !newTitle}
              className="text-xs px-3 py-1 bg-foreground text-background disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create'}
            </button>
            <button
              onClick={() => setCreating(false)}
              className="text-xs px-3 py-1 text-muted-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Album list */}
      <div className="space-y-2">
        {albums.map((album) => {
          const albumPhotos = allPhotos.filter((p) =>
            p.albumSlugs.includes(album.slug)
          );

          return (
            <div
              key={album.slug}
              className="border-b border-border/50 py-4"
            >
              {editingSlug === album.slug ? (
                <div className="space-y-3">
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
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full text-xs bg-muted px-2 py-1 border border-border"
                    placeholder="Location"
                  />
                  <input
                    value={editDateCaptured}
                    onChange={(e) => setEditDateCaptured(e.target.value)}
                    className="w-full text-xs bg-muted px-2 py-1 border border-border"
                    placeholder="Date captured (e.g. 2025-03 or 2025-03 to 2025-04)"
                  />
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={editPublished}
                      onChange={(e) => setEditPublished(e.target.checked)}
                    />
                    Published
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
                      onClick={() => setEditingSlug(null)}
                      className="text-xs px-3 py-1 text-muted-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{album.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      /{album.slug} · {album.photoCount} photos
                      {album.location?.name && ` · ${album.location.name}`}
                      {album.dateCaptured && ` · ${album.dateCaptured}`}
                      {!album.published && ' · (draft)'}
                    </p>
                    {album.description && (
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {album.description}
                      </p>
                    )}
                    {/* Photo thumbnails preview */}
                    {albumPhotos.length > 0 && (
                      <div className="flex gap-1 mt-3">
                        {albumPhotos.slice(0, 6).map((photo) => (
                          <div
                            key={photo.id}
                            className="w-10 h-10 bg-muted overflow-hidden relative flex-shrink-0"
                          >
                            <Image
                              src={photo.urls.thumb}
                              alt={photo.title}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        ))}
                        {albumPhotos.length > 6 && (
                          <div className="w-10 h-10 bg-muted flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] text-muted-foreground">
                              +{albumPhotos.length - 6}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => startEdit(album)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteAlbum(album.slug)}
                      className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
