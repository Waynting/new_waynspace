export interface Photo {
  key: string;
  url: string;
  name: string;
  size?: number;
  lastModified?: Date;
}

export interface ExifData {
  DateTimeOriginal?: string;
  Make?: string;
  Model?: string;
  LensModel?: string;
  ISO?: number;
  FNumber?: number;
  ExposureTime?: number;
  FocalLength?: number;
}

export interface Folder {
  name: string;
  path: string;
  photoCount?: number;
}

export interface PhotoWithExif extends Photo {
  exif?: ExifData;
}

