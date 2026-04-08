// ── EXIF & Location ──

export interface PhotoExif {
  camera?: string;          // "Sony A7III"
  lens?: string;            // "FE 35mm F1.4 GM"
  focalLength?: string;     // "35mm"
  aperture?: string;        // "f/1.4"
  shutterSpeed?: string;    // "1/125s"
  iso?: number;             // 400
  dateTimeOriginal?: string; // ISO 8601 from EXIF
}

export interface PhotoLocation {
  name: string;             // "Taipei, Taiwan"
  country?: string;
  city?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// ── Photo ──

export interface PhotoMeta {
  id: string;               // "20250315-taipei-night-01"
  title: string;
  description?: string;
  dateTaken: string;        // ISO 8601
  dateUploaded: string;     // ISO 8601
  location?: PhotoLocation;
  exif?: PhotoExif;
  tags: string[];
  albumSlugs: string[];
  featured?: boolean;
  aspectRatio: number;      // width / height
}

export interface Photo extends PhotoMeta {
  urls: {
    original: string;
    display: string;
    thumb: string;
  };
}

// ── Album ──

export interface AlbumMeta {
  slug: string;
  title: string;
  description?: string;
  location?: PhotoLocation;
  dateCaptured?: string;    // "2025-03" or "2025-03 to 2025-04"
  dateCreated: string;      // ISO 8601
  coverPhotoId?: string;
  photoIds: string[];       // ordered
  tags: string[];
  published: boolean;
}

export interface Album extends AlbumMeta {
  coverUrl: string;
  photoCount: number;
}

// ── Index files stored in R2 ──

export interface PortfolioIndex {
  photos: PhotoMeta[];
  updatedAt: string;
}

export interface AlbumsIndex {
  albums: AlbumMeta[];
  updatedAt: string;
}
