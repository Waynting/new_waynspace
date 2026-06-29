import exifr from "exifr";
import { ExifData } from "@/types";

export async function extractExifFromBuffer(buffer: Buffer | ArrayBuffer | Uint8Array): Promise<ExifData | null> {
  try {
    const exif = await exifr.parse(buffer, {
      pick: [
        "DateTimeOriginal",
        "Make",
        "Model",
        "LensModel",
        "ISO",
        "FNumber",
        "ExposureTime",
        "FocalLength",
      ],
    });

    if (!exif) {
      return null;
    }

    const exifData: ExifData = {};

    if (exif.DateTimeOriginal) {
      exifData.DateTimeOriginal = exif.DateTimeOriginal;
    }
    if (exif.Make) {
      exifData.Make = exif.Make;
    }
    if (exif.Model) {
      exifData.Model = exif.Model;
    }
    if (exif.LensModel) {
      exifData.LensModel = exif.LensModel;
    }
    if (exif.ISO) {
      exifData.ISO = exif.ISO;
    }
    if (exif.FNumber) {
      exifData.FNumber = exif.FNumber;
    }
    if (exif.ExposureTime) {
      exifData.ExposureTime = exif.ExposureTime;
    }
    if (exif.FocalLength) {
      exifData.FocalLength = exif.FocalLength;
    }

    return Object.keys(exifData).length > 0 ? exifData : null;
  } catch (error) {
    console.error("Error extracting EXIF:", error);
    return null;
  }
}

export async function extractExifFromUrl(url: string): Promise<ExifData | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return await extractExifFromBuffer(arrayBuffer);
  } catch (error) {
    console.error("Error extracting EXIF from URL:", error);
    return null;
  }
}

