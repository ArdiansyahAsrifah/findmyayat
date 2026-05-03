import { QF_API_BASE, getContentToken, qfHeaders } from "@/lib/contentToken";

// Ibn Kathir (English) resource ID = 169
const IBN_KATHIR_ID = 169;

export async function getTafsirByAyah(
  surahNumber: number,
  verseNumber: number
) {
  const ayahKey = `${surahNumber}:${verseNumber}`;
  const url = `${QF_API_BASE}/content/api/v4/tafsirs/${IBN_KATHIR_ID}/by_ayah/${ayahKey}`;

  console.log("[qfTafsir] fetching:", url); // ← cek URL di log

  const token = await getContentToken();
  const res = await fetch(url, {
    headers: qfHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Get tafsir failed: ${res.status} ${err}`);
  }

  return res.json();
}