import { QF_API_BASE, getContentToken, qfHeaders } from "@/lib/contentToken";

const IBN_KATHIR_ID = 169;

export async function getTafsirByAyah(
  surahNumber: number,
  verseNumber: number
) {
  const ayahKey = `${surahNumber}:${verseNumber}`;
  const url = `${QF_API_BASE}/content/api/v4/tafsirs/${IBN_KATHIR_ID}/by_ayah/${ayahKey}`;

  console.log("[qfTafsir] URL:", url);
  console.log("[qfTafsir] QF_API_BASE:", QF_API_BASE);
  console.log("[qfTafsir] QF_ENV:", process.env.QF_ENV);

  const token = await getContentToken();
  const res = await fetch(url, {
    headers: qfHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Get tafsir failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  console.log("[qfTafsir] response keys:", Object.keys(data));

  if (data.tafsir) return data.tafsir;
  if (data.tafsirs?.length > 0) return data.tafsirs[0];

  throw new Error("No tafsir found");
}