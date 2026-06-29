import { NextRequest, NextResponse } from "next/server";
import { getPhotoObject } from "@/lib/r2";
import { extractExifFromBuffer } from "@/lib/exif";

// 强制动态渲染，因为使用了 searchParams
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Photo key is required" },
        { status: 400 }
      );
    }

    const photoObject = await getPhotoObject(key);
    
    if (!photoObject.Body) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    const byteArray = await photoObject.Body.transformToByteArray();
    const buffer = Buffer.from(byteArray);
    const exif = await extractExifFromBuffer(buffer);

    return NextResponse.json(
      { exif },
      {
        headers: {
          // EXIF 数据不会改变，缓存1小时
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    console.error("Error fetching EXIF:", error);
    return NextResponse.json(
      { error: "Failed to fetch EXIF data" },
      { status: 500 }
    );
  }
}

