import { Ayat } from "@/types";

const BOOKMARKS_KEY = "findmyayat_bookmarks";
const KIT_KEY = "findmyayat_kit";

// ─── Bookmarks ────────────────────────────────────────────
export const getBookmarks = (): Ayat[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addBookmark = (ayat: Ayat): void => {
  const bookmarks = getBookmarks();
  const exists = bookmarks.find((b) => b.id === ayat.id);
  if (!exists) {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...bookmarks, ayat]));
  }
};

export const removeBookmark = (ayatId: number): void => {
  const bookmarks = getBookmarks();
  localStorage.setItem(
    BOOKMARKS_KEY,
    JSON.stringify(bookmarks.filter((b) => b.id !== ayatId))
  );
};

export const isBookmarked = (ayatId: number): boolean => {
  return getBookmarks().some((b) => b.id === ayatId);
};

// ─── Kit ──────────────────────────────────────────────────
export interface KitItem {
  situationTitle: string;
  situationEmoji: string;
  situationSlug: string;
  ayat: Ayat;
  reflection?: string;
  savedAt: string;
}

export const getKit = (): KitItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(KIT_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addToKit = (
  ayat: Ayat,
  situationTitle: string,
  situationEmoji: string,
  situationSlug: string
): void => {
  const kit = getKit();
  const exists = kit.find((k) => k.ayat.id === ayat.id);
  if (!exists) {
    const newItem: KitItem = {
      situationTitle,
      situationEmoji,
      situationSlug,
      ayat,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(KIT_KEY, JSON.stringify([...kit, newItem]));
  }
};

export const removeFromKit = (ayatId: number): void => {
  const kit = getKit();
  localStorage.setItem(
    KIT_KEY,
    JSON.stringify(kit.filter((k) => k.ayat.id !== ayatId))
  );
};

export const updateReflection = (ayatId: number, reflection: string): void => {
  const kit = getKit();
  const updated = kit.map((k) =>
    k.ayat.id === ayatId ? { ...k, reflection } : k
  );
  localStorage.setItem(KIT_KEY, JSON.stringify(updated));
};