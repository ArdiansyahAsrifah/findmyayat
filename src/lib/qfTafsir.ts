import { QF_API_BASE, getContentToken, qfHeaders } from "@/lib/contentToken";

const IBN_KATHIR_ID = 169;

export async function getTafsirByAyah(
  surahNumber: number,
  verseNumber: number
) {
  const token = await getContentToken();

  // Coba path /by_ayah dengan verse_key sebagai path param
  const verseKey = `${surahNumber}:${verseNumber}`;
  const url = `${QF_API_BASE}/content/api/v4/tafsirs/${IBN_KATHIR_ID}?verse_key=${verseKey}&fields=verse_number,verse_key,resource_name,language_name`;

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
  console.log("[qfTafsir] response keys:", Object.keys(data));

  const tafsirs: any[] = data.tafsirs ?? [];
  const match = tafsirs.find(
    (t) => t.verse_key === verseKey || t.verse_number === verseNumber
  );

  if (!match) throw new Error(`Tafsir not found for ${verseKey}`);
  return match;
}