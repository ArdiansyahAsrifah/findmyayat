"use client";

import { useState, useEffect } from "react";
import { Ayat, Situation } from "@/types";
import AyatCard from "@/components/AyatCard";
import Link from "next/link";
import {
  addBookmark,
  removeBookmark,
  isBookmarked,
  addToKit,
  getKit,
} from "@/lib/storage";

interface Props {
  situation: Situation;
  initialAyats: Ayat[];
}

export default function SituationPageClient({
  situation,
  initialAyats,
}: Props) {
  const [ayats] = useState<Ayat[]>(initialAyats);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [kitCount, setKitCount] = useState(0);
  const [showKitToast, setShowKitToast] = useState(false);
  const [showBookmarkToast, setShowBookmarkToast] = useState(false);
  const [bookmarkToastMsg, setBookmarkToastMsg] = useState("");

  useEffect(() => {
    // Load existing bookmarks & kit from localStorage
    const bookmarks = ayats
      .filter((a) => isBookmarked(a.id))
      .map((a) => a.id);
    setBookmarkedIds(bookmarks);
    setKitCount(getKit().length);
  }, [ayats]);

  const handleBookmark = (ayat: Ayat) => {
    if (isBookmarked(ayat.id)) {
      removeBookmark(ayat.id);
      setBookmarkedIds((prev) => prev.filter((id) => id !== ayat.id));
      setBookmarkToastMsg("Bookmark dihapus");
    } else {
      addBookmark(ayat);
      setBookmarkedIds((prev) => [...prev, ayat.id]);
      setBookmarkToastMsg("🔖 Ayat di-bookmark!");
    }
    setShowBookmarkToast(true);
    setTimeout(() => setShowBookmarkToast(false), 2000);
  };

  const handleAddToKit = (ayat: Ayat) => {
    addToKit(ayat, situation.title, situation.emoji, situation.slug);
    setKitCount(getKit().length);
    setShowKitToast(true);
    setTimeout(() => setShowKitToast(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-20">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-600 text-sm mb-6 transition-colors"
      >
        <span>←</span>
        <span>Kembali</span>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="text-5xl mb-3">{situation.emoji}</div>
        <h1 className="text-2xl font-bold text-stone-800 mb-2">
          {situation.title}
        </h1>
        <p className="text-stone-500 text-sm">{situation.description}</p>
      </div>

      {/* Kit Summary Bar */}
      {kitCount > 0 && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>📦</span>
            <span className="text-purple-700 text-sm font-medium">
              {kitCount} ayat di Kit kamu
            </span>
          </div>
          <Link
            href="/my-kit"
            className="text-purple-600 text-xs font-medium hover:text-purple-800"
          >
            Lihat Kit →
          </Link>
        </div>
      )}

      {/* Ayat List */}
      {ayats.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">Tidak ada ayat ditemukan</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {ayats.map((ayat) => (
            <AyatCard
              key={ayat.id}
              ayat={ayat}
              onBookmark={handleBookmark}
              onAddToKit={handleAddToKit}
              isBookmarked={bookmarkedIds.includes(ayat.id)}
            />
          ))}
        </div>
      )}

      {/* Toast Notifications */}
      {showBookmarkToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">
          {bookmarkToastMsg}
        </div>
      )}
      {showKitToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">
          📦 Ditambahkan ke Kit!
        </div>
      )}
    </div>
  );
}