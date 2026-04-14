import axios from "axios";
import { Ayat } from "@/types";

const BASE_URL = "https://api.quran.com/api/v4";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Convert surah+verse to global ayah number ────────────
export const toGlobalAyahNumber = (surah: number, verse: number): number => {
  const surahLengths = [
    7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,
    112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,
    59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,
    52,52,44,28,28,20,56,40,31,50,22,31,13,54,13,18,10,30,9,11,21,26,11,
    16,23,21,13,11,20,21,38,17,16,26,24,27,33,26,30,20,18,31,13,25,14,13,25,
    16,9,20,35,25,20,13
  ];

  let globalNumber = 0;
  for (let i = 0; i < surah - 1; i++) {
    globalNumber += surahLengths[i];
  }
  globalNumber += verse;
  return globalNumber;
};

// ─── Construct audio URL using CDN ────────────────────────
export const getAudioUrl = (
  chapterNumber: number,
  verseNumber: number
): string => {
  const globalAyah = toGlobalAyahNumber(chapterNumber, verseNumber);
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyah}.mp3`;
};

// ─── Search verses by query ───────────────────────────────
export const searchVerses = async (query: string, size: number = 5) => {
  const response = await api.get(`/search`, {
    params: {
      q: query,
      size,
      language: "en",
    },
  });
  return response.data;
};

// ─── Get single verse with full details ───────────────────
export const getVerse = async (chapterNumber: number, verseNumber: number) => {
  const response = await api.get(
    `/verses/by_key/${chapterNumber}:${verseNumber}`,
    {
      params: {
        language: "id",
        words: false,
        translations: "33",
        tafsirs: "169",
      },
    }
  );
  return response.data;
};

// ─── Get chapter info ─────────────────────────────────────
export const getChapter = async (chapterNumber: number) => {
  const response = await api.get(`/chapters/${chapterNumber}`, {
    params: { language: "id" },
  });
  return response.data;
};

// ─── Get tafsir for a verse ───────────────────────────────
export const getTafsir = async (
  chapterNumber: number,
  verseNumber: number
) => {
  try {
    const response = await api.get(
      `/tafsirs/169/by_ayah/${chapterNumber}:${verseNumber}`
    );
    return response.data;
  } catch {
    return null;
  }
};

// ─── Map search result to Ayat type ──────────────────────
export const mapSearchResultToAyat = (result: any): Ayat => {
  const [surahNum, verseNum] = result.verse_key.split(":").map(Number);
  return {
    id: result.verse_id,
    surahNumber: surahNum,
    surahName: `Surah ${surahNum}`,
    surahNameArabic: "",
    verseNumber: verseNum,
    textArabic: result.text,
    textTranslation:
      result.translations?.[0]?.text?.replace(/<[^>]*>/g, "") || "",
    tafsir: "",
    audioUrl: getAudioUrl(surahNum, verseNum),
  };
};

// ─── Map full verse response to Ayat type ────────────────
export const mapVerseToAyat = (verse: any, chapterName?: string): Ayat => {
  return {
    id: verse.id,
    surahNumber: verse.chapter_id,
    surahName: chapterName || `Surah ${verse.chapter_id}`,
    surahNameArabic: "",
    verseNumber: verse.verse_number,
    textArabic: verse.text_uthmani,
    textTranslation:
      verse.translations?.[0]?.text?.replace(/<[^>]*>/g, "") || "",
    tafsir:
      verse.tafsirs?.[0]?.text?.replace(/<[^>]*>/g, "").slice(0, 400) || "",
    audioUrl: getAudioUrl(verse.chapter_id, verse.verse_number),
  };
};

// ─── Fetch ayats by situation (main function) ─────────────
export const getAyatsBySituation = async (
  searchQuery: string,
  limit: number = 5
): Promise<Ayat[]> => {
  try {
    const searchResult = await searchVerses(searchQuery, limit);
    const results = searchResult?.search?.results || [];

    const enriched = await Promise.all(
      results.map(async (result: any) => {
        const ayat = mapSearchResultToAyat(result);
        const [surah, verse] = result.verse_key.split(":").map(Number);

        try {
          const fullVerse = await getVerse(surah, verse);
          if (fullVerse?.verse) {
            ayat.textTranslation =
              fullVerse.verse.translations?.[0]?.text?.replace(
                /<[^>]*>/g,
                ""
              ) || ayat.textTranslation;
            ayat.tafsir =
              fullVerse.verse.tafsirs?.[0]?.text
                ?.replace(/<[^>]*>/g, "")
                .slice(0, 400) || "";
          }
        } catch {
          // fallback to search result translation
        }

        return ayat;
      })
    );

    return enriched;
  } catch (error) {
    console.error("Error fetching ayats:", error);
    return [];
  }
};