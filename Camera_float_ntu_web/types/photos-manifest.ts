export interface PhotoManifestPhoto {
  key: string;
  name: string;
  url: string;
  size?: number;
  lastModified?: string;
  width?: number;
  height?: number;
}

export interface FolderManifest {
  photos: PhotoManifestPhoto[];
  total: number;
}

export interface PhotosManifest {
  generatedAt: string;
  folders: Record<string, FolderManifest>;
}

export interface ManifestIndex {
  generatedAt: string;
  folders: Record<string, { total: number; file: string }>;
}

