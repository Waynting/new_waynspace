import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

export const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export const R2_BUCKET = process.env.R2_BUCKET || 'blog-post';
export const R2_BASE_URL = process.env.R2_BASE_URL || 'https://img.waynspace.com';

export async function fetchJson<T>(key: string): Promise<T | null> {
  try {
    const response = await s3Client.send(
      new GetObjectCommand({ Bucket: R2_BUCKET, Key: key })
    );
    const body = await response.Body?.transformToString();
    if (!body) return null;
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}

export async function uploadJson(key: string, data: unknown) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
    })
  );
}

// Strict pattern for photo IDs and album slugs
const SAFE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,80}$/;

export function validateId(id: string): NextResponse | null {
  if (!SAFE_ID_PATTERN.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  return null;
}

export function devOnly(): NextResponse | null {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return null;
}
