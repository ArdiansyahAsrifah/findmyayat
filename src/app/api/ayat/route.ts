import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const surah = searchParams.get("surah");
  const verse = searchParams.get("verse");

  if (!surah || !verse) {
    return NextResponse.json(
      { error: "surah and verse are required" },
      { status: 400 }
    );
  }

  try {
    // Fetch verse detail + translation
    const [verseRes, chapterRes] = await Promise.all([
      fetch(
        `https://api.qurancdn.com/api/qdc/verses/by_key/${surah}:${verse}?words=false&translation_fields=text&translations=131&fields=text_uthmani`,
        { cache: "force-cache" }
      ),
      fetch(
        `https://api.qurancdn.com/api/qdc/chapters/${surah}?language=en`,
        { cache: "force-cache" }
      ),
    ]);

    if (!verseRes.ok || !chapterRes.ok) {
      return NextResponse.json({ error: "Failed to fetch ayat" }, { status: 500 });
    }

    const [verseData, chapterData] = await Promise.all([
      verseRes.json(),
      chapterRes.json(),
    ]);

    const v = verseData.verse;
    const chapter = chapterData.chapter;

    if (!v || !chapter) {
      return NextResponse.json({ error: "Ayat not found" }, { status: 404 });
    }

    const translation =
      v.translations?.[0]?.text?.replace(/<[^>]+>/g, "") ?? "";

    // Audio URL format Quran.com (Sheikh Mishari Rashid)
    const surahPadded = String(surah).padStart(3, "0");
    const versePadded = String(verse).padStart(3, "0");
    const audioUrl = `https://verses.quran.com/Alafasy/mp3/${surahPadded}${versePadded}.mp3`;

    const ayat = {
      id: v.id,
      surahNumber: parseInt(surah),
      verseNumber: parseInt(verse),
      surahName: chapter.name_simple,
      surahNameArabic: chapter.name_arabic,
      textArabic: v.text_uthmani,
      textTranslation: translation,
      audioUrl,
      verseKey: `${surah}:${verse}`,
    };

    return NextResponse.json({ ayat });
  } catch (err) {
    console.error("[/api/ayat] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}