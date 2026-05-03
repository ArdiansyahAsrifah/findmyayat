import { NextRequest, NextResponse } from "next/server";
import { getTafsirByAyah } from "@/lib/qfTafsir";

import { QF_API_BASE, getContentToken, qfHeaders } from "@/lib/contentToken";

// Temporary: cek available tafsirs
export async function POST(req: NextRequest) {
  const token = await getContentToken();
  const res = await fetch(`${QF_API_BASE}/content/api/v4/resources/tafsirs`, {
    headers: qfHeaders(token),
  });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const surah = searchParams.get("surah");
  const verse = searchParams.get("verse");

  if (!surah || !verse)
    return NextResponse.json(
      { error: "Missing surah or verse" },
      { status: 400 }
    );

  try {
    const tafsir = await getTafsirByAyah(Number(surah), Number(verse));
    return NextResponse.json({ tafsir });
  } catch (err) {
    console.error("[GET /api/tafsir]", err);
    return NextResponse.json(
      { error: "Failed to fetch tafsir" },
      { status: 500 }
    );
  }
}