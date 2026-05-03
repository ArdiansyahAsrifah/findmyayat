"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import AyatCard from "@/components/AyatCard";
import Link from "next/link";
import { Ayat } from "@/types";

type Tab = "kit" | "bookmarks";

interface BookmarkItem {
  id: number;
  verse_key: string;
  ayat?: Ayat;
}

interface CollectionItem {
  verse_key: string;
  ayat?: Ayat;
}

export default function MyKitPage() {
  const [activeTab, setActiveTab] = useState<Tab>("kit");
  const [kit, setKit] = useState<CollectionItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loadingKit, setLoadingKit] = useState(false);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "kit") fetchKit();
    if (activeTab === "bookmarks") fetchBookmarks();
  }, [activeTab]);

  async function fetchKit() {
    setLoadingKit(true);
    setError(null);
    try {
      const res = await fetch("/api/collections");
      if (res.status === 401) {
        setError("Please login to view your kit");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch kit");
      const data = await res.json();
      setKit(data.items?.data ?? data.items ?? []);
    } catch {
      setError("Failed to load kit");
    } finally {
      setLoadingKit(false);
    }
  }

  async function fetchBookmarks() {
    setLoadingBookmarks(false);
    setError(null);
    try {
      const res = await fetch("/api/bookmarks");
      if (res.status === 401) {
        setError("Please login to view your bookmarks");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch bookmarks");
      const data = await res.json();
      setBookmarks(data.bookmarks ?? data.data ?? data ?? []);
    } catch {
      setError("Failed to load bookmarks");
    } finally {
      setLoadingBookmarks(false);
    }
  }

  async function handleRemoveFromKit(verseKey: string) {
    try {
      await fetch("/api/collections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verseKey }),
      });
      setKit((prev) => prev.filter((item) => item.verse_key !== verseKey));
    } catch {
      setError("Failed to remove from kit");
    }
  }

  async function handleRemoveBookmark(bookmarkId: number) {
    try {
      await fetch("/api/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarkId }),
      });
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
    } catch {
      setError("Failed to remove bookmark");
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-20">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-800 mb-1">My Kit</h1>
          <p className="text-stone-500 text-sm">Your collection</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("kit")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "kit"
                ? "bg-white text-stone-800 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            📦 Kit ({kit.length})
          </button>
          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "bookmarks"
                ? "bg-white text-stone-800 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            🔖 Bookmarks ({bookmarks.length})
          </button>
        </div>

        {/* Kit Tab */}
        {activeTab === "kit" && (
          <div>
            {loadingKit ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse h-40 rounded-2xl bg-stone-100" />
                ))}
              </div>
            ) : kit.length === 0 ? (
              <div className="text-center py-20 text-stone-400">
                <p className="text-4xl mb-3">📦</p>
                <p className="text-sm mb-4">Kit kamu masih kosong</p>
                <Link
                  href="/"
                  className="text-emerald-600 text-sm font-medium hover:text-emerald-700"
                >
                  Temukan ayatmu →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {kit.map((item) => {
                  const [surah, verse] = item.verse_key.split(":");
                  return (
                    <div key={item.verse_key}>
                      {item.ayat ? (
                        <AyatCard ayat={item.ayat} />
                      ) : (
                        // Fallback jika ayat detail belum di-fetch
                        <div
                          className="rounded-2xl px-5 py-4 text-sm text-stone-600"
                          style={{
                            background: "linear-gradient(135deg, #faf9f7, #f5f2ec)",
                            border: "1px solid rgba(180,160,120,0.2)",
                          }}
                        >
                          📖 Surah {surah}, Verse {verse}
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveFromKit(item.verse_key)}
                        className="mt-1 text-xs text-stone-300 hover:text-red-400 transition-colors"
                      >
                        Hapus dari Kit
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Bookmarks Tab */}
        {activeTab === "bookmarks" && (
          <div>
            {loadingBookmarks ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse h-40 rounded-2xl bg-stone-100" />
                ))}
              </div>
            ) : bookmarks.length === 0 ? (
              <div className="text-center py-20 text-stone-400">
                <p className="text-4xl mb-3">🔖</p>
                <p className="text-sm mb-4">Nothing Found</p>
                <Link
                  href="/"
                  className="text-emerald-600 text-sm font-medium hover:text-emerald-700"
                >
                  Search your ayat →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {bookmarks.map((bookmark) => (
                  <div key={bookmark.id}>
                    {bookmark.ayat ? (
                      <AyatCard ayat={bookmark.ayat} isBookmarked />
                    ) : (
                      <div
                        className="rounded-2xl px-5 py-4 text-sm text-stone-600"
                        style={{
                          background: "linear-gradient(135deg, #faf9f7, #f5f2ec)",
                          border: "1px solid rgba(180,160,120,0.2)",
                        }}
                      >
                        📖 {bookmark.verse_key}
                      </div>
                    )}
                    <button
                      onClick={() => handleRemoveBookmark(bookmark.id)}
                      className="mt-1 text-xs text-stone-300 hover:text-red-400 transition-colors"
                    >
                      Hapus bookmark
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}