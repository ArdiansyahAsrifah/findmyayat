import { QF_API_BASE, getContentToken, qfHeaders } from "@/lib/contentToken";

const IBN_KATHIR_ID = 169;

// QF_API_BASE = https://apis-prelive.quran.foundation
// Content API base = QF_API_BASE + /content/api/v4
const CONTENT_BASE = `${QF_API_BASE}/content/api/v4`;

export async function getTafsirByAyah(
  surahNumber: number,
  verseNumber: number
) {
  const token = await getContentToken();
  const verseKey = `${surahNumber}:${verseNumber}`;

  // Fetch seluruh surah, lalu filter per ayat
  const url = `${CONTENT_BASE}/tafsirs/${IBN_KATHIR_ID}/by_chapter/${surahNumber}?fields=verse_number,verse_key,resource_name,language_name,text`;

  console.log("[qfTafsir] fetching:", url);

  const res = await fetch(url, {
    headers: qfHeaders(token),
    cache: "no-store",
  });

  console.log("[qfTafsir] status:", res.status);

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Get tafsir failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  console.log("[qfTafsir] keys:", Object.keys(data));

  const tafsirs: any[] = data.tafsirs ?? [];
  const match = tafsirs.find(
    (t) => t.verse_key === verseKey || t.verse_number === verseNumber
  );

  if (!match) throw new Error(`Tafsir not found for ${verseKey}`);
  return match;
}