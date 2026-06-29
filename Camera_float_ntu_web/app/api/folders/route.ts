import { NextResponse } from "next/server";
import { listFolders } from "@/lib/r2";

export async function GET() {
  try {
    const folders = await listFolders();
    return NextResponse.json(
      { folders },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

