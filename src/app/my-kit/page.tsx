"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import AyatCard from "@/components/AyatCard";
import Link from "next/link";
import { Ayat } from "@/types";
import NotePanel from "@/components/NotePanel";

type Tab = "kit" | "bookmarks";

interface CollectionItem {
  id: string;
  key: number;
  verseNumber: number | null;
  type: string;
  group: string;
  isInDefaultCollection: boolean;
  isReading: boolean | null;
  ayat?: Ayat;
}

interface BookmarkItem {
  id: string;
  key: number;
  verseNumber: number | null;
  type: string;
  group: string;
  isInDefaultCollection: boolean;
  isReading: boolean | null;
  ayat?: Ayat;
}

async function fetchAyatDetail(surahNumber: number, verseNumber: number): Promise<Ayat | null> {
  try {
    const res = await fetch(`/api/ayat?surah=${surahNumber}&verse=${verseNumber}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.ayat ?? data ?? null;
  } catch {
    return null;
  }
}

export default function MyKitPage() {
  const [activeTab, setActiveTab] = useState<Tab>("kit");
  const [kit, setKit] = useState<CollectionItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loadingKit, setLoadingKit] = useState(false);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [confirmBookmarkId, setConfirmBookmarkId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "kit") fetchKit();
    if (activeTab === "bookmarks") fetchBookmarks();
  }, [activeTab]);

  async function fetchKit() {
    setLoadingKit(true);
    setError(null);
    try {
      const res = await fetch("/api/collections");
      if (res.status === 401) { setError("Please login to view your kit"); return; }
      if (!res.ok) throw new Error("Failed to fetch kit");
      const data = await res.json();
      const items: CollectionItem[] = data.items ?? [];
      const itemsWithAyat = await Promise.all(
        items
          .filter((item) => item.type === "ayah" && item.verseNumber != null)
          .map(async (item) => {
            const ayat = await fetchAyatDetail(item.key, item.verseNumber!);
            return { ...item, ayat: ayat ?? undefined };
          })
      );
      setKit(itemsWithAyat);
    } catch {
      setError("Failed to load kit");
    } finally {
      setLoadingKit(false);
    }
  }

  async function fetchBookmarks() {
    setLoadingBookmarks(true);
    setError(null);
    try {
      const res = await fetch("/api/bookmarks");
      if (res.status === 401) { setError("Please login to view your bookmarks"); return; }
      if (!res.ok) throw new Error("Failed to fetch bookmarks");
      const data = await res.json();
      const items: BookmarkItem[] = data.data ?? data.bookmarks ?? [];
      const itemsWithAyat = await Promise.all(
        items
          .filter((item) => item.type === "ayah" && item.verseNumber != null)
          .map(async (item) => {
            const ayat = await fetchAyatDetail(item.key, item.verseNumber!);
            return { ...item, ayat: ayat ?? undefined };
          })
      );
      setBookmarks(itemsWithAyat);
    } catch {
      setError("Failed to load bookmarks");
    } finally {
      setLoadingBookmarks(false);
    }
  }

  async function handleRemoveFromKit(bookmarkId: string) {
    try {
      await fetch("/api/collections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarkId }),
      });
      setKit((prev) => prev.filter((item) => item.id !== bookmarkId));
    } catch {
      setError("Failed to remove from kit");
    } finally {
      setConfirmRemoveId(null);
    }
  }

  async function handleRemoveBookmark(bookmarkId: string) {
    try {
      await fetch("/api/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarkId }),
      });
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
    } catch {
      setError("Failed to remove bookmark");
    } finally {
      setConfirmBookmarkId(null);
    }
  }

  function getVerseLabel(item: CollectionItem | BookmarkItem): string {
    if (item.type === "ayah" && item.verseNumber != null) return `Surah ${item.key}, Ayat ${item.verseNumber}`;
    if (item.type === "surah") return `Surah ${item.key}`;
    if (item.type === "juz") return `Juz ${item.key}`;
    if (item.type === "page") return `Page ${item.key}`;
    return `${item.key}`;
  }

  const Skeleton = () => (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse h-48 rounded-2xl" style={{ background: "#E8E2D6" }} />
      ))}
    </div>
  );

  /* Reusable remove button row */
  function RemoveBar({
    label,
    confirmId,
    itemId,
    onConfirmRequest,
    onCancel,
    onConfirm,
  }: {
    label: string;
    confirmId: string | null;
    itemId: string;
    onConfirmRequest: () => void;
    onCancel: () => void;
    onConfirm: () => void;
  }) {
    const isConfirming = confirmId === itemId;
    return (
      <div className="flex items-center justify-end gap-2 mt-2 px-1">
        {isConfirming ? (
          <>
            <span className="text-xs mr-auto" style={{ color: "#6B6B5E" }}>
              Yakin ingin menghapus?
            </span>
            <button
              onClick={onCancel}
              className="text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
              style={{ border: "0.5px solid #E8E2D6", color: "#6B6B5E", background: "transparent" }}
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
              style={{ background: "#c0392b", color: "#FFFFFF" }}
            >
              Hapus
            </button>
          </>
        ) : (
          <button
            onClick={onConfirmRequest}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
            style={{
              border: "0.5px solid rgba(192,57,43,0.25)",
              color: "#c0392b",
              background: "rgba(192,57,43,0.04)",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 2.5h9M4 2.5V1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M2 2.5l.5 7a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5l.5-7" />
            </svg>
            {label}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F5F0E8" }}>
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pt-24 pb-20">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#1A1A1A" }}>My Kit</h1>
          <p className="text-sm" style={{ color: "#6B6B5E" }}>Your collection</p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{
              background: "rgba(192, 57, 43, 0.06)",
              border: "0.5px solid rgba(192, 57, 43, 0.2)",
              color: "#c0392b",
            }}
          >
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "#E8E2D6" }}>
          {(["kit", "bookmarks"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all"
              style={
                activeTab === tab
                  ? { background: "#FFFFFF", color: "#1A1A1A" }
                  : { background: "transparent", color: "#6B6B5E" }
              }
            >
              {tab === "kit" ? `📦 Kit (${kit.length})` : `🔖 Bookmarks (${bookmarks.length})`}
            </button>
          ))}
        </div>

        {/* KIT */}
        {activeTab === "kit" && (
          <div>
            {loadingKit ? (
              <Skeleton />
            ) : kit.length === 0 ? (
              <div className="text-center py-20" style={{ color: "#6B6B5E" }}>
                <p className="text-4xl mb-3">📦</p>
                <p className="text-sm mb-4">Kit kamu masih kosong</p>
                <Link href="/" className="text-sm font-medium" style={{ color: "#1C4F3A" }}>
                  Temukan ayatmu →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {kit.map((item) => (
                  <div key={item.id}>
                    {item.ayat ? (
                      <AyatCard ayat={item.ayat} isInKit hideActions />
                    ) : (
                      <div
                        className="rounded-2xl px-5 py-4 text-sm"
                        style={{ color: "#6B6B5E", background: "#FFFFFF", border: "0.5px solid #E8E2D6" }}
                      >
                        📖 {getVerseLabel(item)}
                      </div>
                    )}

                    {item.ayat && (
                      <NotePanel
                        surahNumber={item.ayat.surahNumber}
                        verseNumber={item.ayat.verseNumber}
                      />
                    )}

                    <RemoveBar
                      label="Hapus dari Kit"
                      confirmId={confirmRemoveId}
                      itemId={item.id}
                      onConfirmRequest={() => setConfirmRemoveId(item.id)}
                      onCancel={() => setConfirmRemoveId(null)}
                      onConfirm={() => handleRemoveFromKit(item.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOOKMARKS */}
        {activeTab === "bookmarks" && (
          <div>
            {loadingBookmarks ? (
              <Skeleton />
            ) : bookmarks.length === 0 ? (
              <div className="text-center py-20" style={{ color: "#6B6B5E" }}>
                <p className="text-4xl mb-3">🔖</p>
                <p className="text-sm mb-4">Nothing Found</p>
                <Link href="/" className="text-sm font-medium" style={{ color: "#1C4F3A" }}>
                  Search your ayat →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {bookmarks.map((bookmark) => (
                  <div key={bookmark.id}>
                    {bookmark.ayat ? (
                      <AyatCard ayat={bookmark.ayat} isBookmarked hideActions />
                    ) : (
                      <div
                        className="rounded-2xl px-5 py-4 text-sm"
                        style={{ color: "#6B6B5E", background: "#FFFFFF", border: "0.5px solid #E8E2D6" }}
                      >
                        📖 {getVerseLabel(bookmark)}
                      </div>
                    )}

                    <RemoveBar
                      label="Hapus Bookmark"
                      confirmId={confirmBookmarkId}
                      itemId={bookmark.id}
                      onConfirmRequest={() => setConfirmBookmarkId(bookmark.id)}
                      onCancel={() => setConfirmBookmarkId(null)}
                      onConfirm={() => handleRemoveBookmark(bookmark.id)}
                    />
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