export interface Situation {
  id: string;
  slug: string;
  title: string;
  description: string;
  emoji: string;
  category: string;
  searchQuery: string; // query yang dikirim ke Quran API
}

export interface Ayat {
  id: number;
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  verseNumber: number;
  textArabic: string;
  textTranslation: string;
  tafsir?: string;
  audioUrl?: string;
  reflection?: string;
}

export interface Collection {
  id: string;
  name: string;
  ayats: Ayat[];
  situationId: string;
}

export interface Bookmark {
  ayatId: number;
  surahNumber: number;
  verseNumber: number;
  savedAt: string;
}