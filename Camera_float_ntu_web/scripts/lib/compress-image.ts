import sharp from "sharp";

export interface CompressResult {
  buffer: Buffer;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  skipped: boolean;
  skipReason?: string;
}

const SUPPORTED_MAGIC_BYTES: Array<{
  bytes: number[];
  offset: number;
  format: string;
}> = [
  { bytes: [0x52, 0x49, 0x46, 0x46], offset: 0, format: "webp" }, // RIFF (WebP)
  { bytes: [0xff, 0xd8, 0xff], offset: 0, format: "jpeg" },
  { bytes: [0x89, 0x50, 0x4e, 0x47], offset: 0, format: "png" },
  { bytes: [0x49, 0x49, 0x2a, 0x00], offset: 0, format: "tiff" }, // TIFF LE
  { bytes: [0x4d, 0x4d, 0x00, 0x2a], offset: 0, format: "tiff" }, // TIFF BE
];

function detectFormat(buffer: Buffer): string | null {
  for (const sig of SUPPORTED_MAGIC_BYTES) {
    if (buffer.length < sig.offset + sig.bytes.length) continue;
    const match = sig.bytes.every(
      (byte, i) => buffer[sig.offset + i] === byte
    );
    if (match) {
      // Extra check for WebP: bytes 8-11 must be "WEBP"
      if (sig.format === "webp") {
        const webpMarker = buffer.slice(8, 12).toString("ascii");
        if (webpMarker === "WEBP") return "webp";
        continue;
      }
      return sig.format;
    }
  }
  // HEIC/HEIF: ftyp box at offset 4
  if (buffer.length >= 12) {
    const ftyp = buffer.slice(4, 8).toString("ascii");
    const brand = buffer.slice(8, 12).toString("ascii");
    if (ftyp === "ftyp" && (brand.startsWith("heic") || brand.startsWith("heif") || brand.startsWith("mif1") || brand.startsWith("msf1"))) {
      return "heic";
    }
  }
  return null;
}

export async function compressImage(
  inputBuffer: Buffer,
  originalFilename: string
): Promise<CompressResult> {
  const originalSize = inputBuffer.length;

  const format = detectFormat(inputBuffer);

  if (!format) {
    // Fallback: check extension
    const ext = originalFilename.split(".").pop()?.toLowerCase();
    const supported = ["jpg", "jpeg", "png", "webp", "heic", "heif", "tiff"];
    if (!ext || !supported.includes(ext)) {
      return {
        buffer: inputBuffer,
        originalSize,
        compressedSize: originalSize,
        width: 0,
        height: 0,
        skipped: true,
        skipReason: `Unsupported format: ${ext}`,
      };
    }
  }

  const compressedBuffer = await sharp(inputBuffer)
    .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true })
    .withMetadata()
    .webp({ quality: 82, effort: 6, lossless: false, nearLossless: false })
    .toBuffer();

  const metadata = await sharp(compressedBuffer).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const compressedSize = compressedBuffer.length;

  // Safety: if compressed is larger than original, skip
  if (compressedSize >= originalSize) {
    return {
      buffer: inputBuffer,
      originalSize,
      compressedSize: originalSize,
      width,
      height,
      skipped: true,
      skipReason: "Compressed larger than original",
    };
  }

  return {
    buffer: compressedBuffer,
    originalSize,
    compressedSize,
    width,
    height,
    skipped: false,
  };
}
