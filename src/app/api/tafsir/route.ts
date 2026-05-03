import { NextRequest, NextResponse } from "next/server";
import { getTafsirByAyah } from "@/lib/qfTafsir";

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
    const data = await getTafsirByAyah(Number(surah), Number(verse));
    return NextResponse.json({ tafsir: data.tafsir });
  } catch (err) {
    console.error("[GET /api/tafsir]", err);
    return NextResponse.json(
      { error: "Failed to fetch tafsir" },
      { status: 500 }
    );
  }
}