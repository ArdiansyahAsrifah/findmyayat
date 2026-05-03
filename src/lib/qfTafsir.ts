import { QF_API_BASE, getContentToken, qfHeaders } from "@/lib/contentToken";

const CONTENT_BASE = `${QF_API_BASE}/content/api/v4`;

export async function getTafsirByAyah(
  surahNumber: number,
  verseNumber: number
) {
  const token = await getContentToken();
  const verseKey = `${surahNumber}:${verseNumber}`;

  // Coba semua variasi path — slug dan numeric ID
  const attempts = [
    `${CONTENT_BASE}/tafsirs/en-tafisr-ibn-kathir/by_ayah/${verseKey}`,
    `${CONTENT_BASE}/tafsirs/169/by_ayah/${verseKey}`,
    `${CONTENT_BASE}/tafsirs/en-tafisr-ibn-kathir/by_chapter/${surahNumber}`,
    `${CONTENT_BASE}/tafsirs/169/by_chapter/${surahNumber}`,
  ];

  for (const url of attempts) {
    console.log("[qfTafsir] trying:", url);
    const res = await fetch(url, {
      headers: qfHeaders(token),
      cache: "no-store",
    });
    console.log("[qfTafsir] status:", res.status);

    if (res.ok) {
      const data = await res.json();
      console.log("[qfTafsir] SUCCESS keys:", Object.keys(data));

      // by_ayah response
      if (data.tafsir) return data.tafsir;

      // by_chapter response — filter verse
      if (data.tafsirs?.length > 0) {
        const match = data.tafsirs.find(
          (t: any) => t.verse_key === verseKey || t.verse_number === verseNumber
        );
        if (match) return match;
      }
    }
  }

  throw new Error(`Tafsir not available for ${verseKey} in prelive`);
}