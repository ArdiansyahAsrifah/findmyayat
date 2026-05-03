import { QF_API_BASE, getContentToken, qfHeaders } from "@/lib/contentToken";

const IBN_KATHIR_ID = 169;

export async function getTafsirByAyah(
  surahNumber: number,
  verseNumber: number
) {
  const token = await getContentToken();

  // Endpoint by surah — filter verse_number di client
  const url = `${QF_API_BASE}/content/api/v4/tafsirs/${IBN_KATHIR_ID}/by_chapter/${surahNumber}?fields=verse_number,verse_key,resource_name,language_name`;

  console.log("[qfTafsir] fetching:", url);

  const res = await fetch(url, {
    headers: qfHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Get tafsir failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  const tafsirs: any[] = data.tafsirs ?? [];

  // Filter untuk verse yang diminta
  const match = tafsirs.find(
    (t) => t.verse_number === verseNumber || t.verse_key === `${surahNumber}:${verseNumber}`
  );

  if (!match) throw new Error(`Tafsir not found for ${surahNumber}:${verseNumber}`);

  return match;
}