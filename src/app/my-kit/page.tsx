"use client";

import { useState, useEffect } from "react";
import AyatCard from "@/components/AyatCard";
import Link from "next/link";
import { Ayat } from "@/types";
import NotePanel from "@/components/NotePanel";

type Tab = "all" | "kit" | "bookmarks";

interface CollectionItem {
  id: string;
  key: number;
  verseNumber: number | null;
  type: string;
  group: string;
  isInDefaultCollection: boolean;
  isReading: boolean | null;
  ayat?: Ayat;
  savedAt?: string;
  note?: string;
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
  savedAt?: string;
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

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function MyKitPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [kit, setKit] = useState<CollectionItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loadingKit, setLoadingKit] = useState(false);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [confirmBookmarkId, setConfirmBookmarkId] = useState<string | null>(null);

  useEffect(() => {
    fetchKit();
    fetchBookmarks();
  }, []);

  async function fetchKit() {
    setLoadingKit(true);
    setError(null);
    try {
      const res = await fetch("/api/collections");
      if (res.status === 401) { setError("Please login to view your collection"); return; }
      if (!res.ok) throw new Error();
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
      setError("Failed to load collection");
    } finally {
      setLoadingKit(false);
    }
  }

  async function fetchBookmarks() {
    setLoadingBookmarks(true);
    try {
      const res = await fetch("/api/bookmarks");
      if (res.status === 401) return;
      if (!res.ok) throw new Error();
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
      // silent fail
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
      setError("Failed to remove from collection");
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

  const isLoading = loadingKit || loadingBookmarks;

  // Items to display based on tab
  const displayItems: Array<{
    id: string;
    ayat?: Ayat;
    type: "kit" | "bookmark";
    savedAt?: string;
    note?: string;
    key: number;
    verseNumber: number | null;
  }> = [
    ...(activeTab === "all" || activeTab === "kit"
      ? kit.map((k) => ({ ...k, type: "kit" as const }))
      : []),
    ...(activeTab === "all" || activeTab === "bookmarks"
      ? bookmarks.map((b) => ({ ...b, type: "bookmark" as const }))
      : []),
  ];

  const Skeleton = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: 20,
      }}
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            height: 200,
            borderRadius: 20,
            background: "var(--border)",
            animation: "pulse 1.5s ease-in-out infinite",
            opacity: 0.5,
          }}
        />
      ))}
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "56px 48px 80px",
        maxWidth: "var(--content-max)",
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 48,
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        {/* Title */}
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 400,
              color: "var(--fg)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 8,
            }}
          >
            Soul Sanctuary
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--fg-muted)",
              fontWeight: 300,
            }}
          >
            A collection of wisdom you have found.
          </p>
        </div>

        {/* Filter tabs — top right like reference */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "var(--bg-card)",
            borderRadius: 999,
            padding: 4,
            border: "1px solid var(--border)",
            alignSelf: "flex-start",
            marginTop: 8,
          }}
        >
          {(["all", "kit", "bookmarks"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                border: "none",
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
                background: activeTab === tab ? "var(--green)" : "transparent",
                color: activeTab === tab ? "#fff" : "var(--fg-muted)",
              }}
            >
              {tab === "all" ? "All" : tab === "kit" ? "Collection" : "Bookmarks"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            marginBottom: 24,
            padding: "12px 20px",
            borderRadius: 12,
            background: "rgba(192, 57, 43, 0.06)",
            border: "0.5px solid rgba(192, 57, 43, 0.2)",
            color: "#c0392b",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* ── Content ────────────────────────────────────────────── */}
      {isLoading ? (
        <Skeleton />
      ) : displayItems.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            color: "var(--fg-muted)",
          }}
        >
          <p style={{ fontSize: 40, marginBottom: 12 }}>
            {activeTab === "bookmarks" ? "🔖" : "✦"}
          </p>
          <p style={{ fontSize: 14, marginBottom: 20 }}>
            {activeTab === "bookmarks"
              ? "No bookmarks yet"
              : activeTab === "kit"
              ? "Your collection is empty"
              : "Nothing saved yet"}
          </p>
          <Link
            href="/"
            style={{
              fontSize: 13,
              color: "var(--green)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Find your ayat →
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 20,
            alignItems: "start",
          }}
        >
          {displayItems.map((item) => (
            <SanctuaryCard
              key={`${item.type}-${item.id}`}
              item={item}
              confirmRemoveId={confirmRemoveId}
              confirmBookmarkId={confirmBookmarkId}
              setConfirmRemoveId={setConfirmRemoveId}
              setConfirmBookmarkId={setConfirmBookmarkId}
              onRemoveKit={handleRemoveFromKit}
              onRemoveBookmark={handleRemoveBookmark}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

/* ── Individual sanctuary card ──────────────────────────────── */
function SanctuaryCard({
  item,
  confirmRemoveId,
  confirmBookmarkId,
  setConfirmRemoveId,
  setConfirmBookmarkId,
  onRemoveKit,
  onRemoveBookmark,
}: {
  item: {
    id: string;
    ayat?: Ayat;
    type: "kit" | "bookmark";
    savedAt?: string;
    note?: string;
    key: number;
    verseNumber: number | null;
  };
  confirmRemoveId: string | null;
  confirmBookmarkId: string | null;
  setConfirmRemoveId: (id: string | null) => void;
  setConfirmBookmarkId: (id: string | null) => void;
  onRemoveKit: (id: string) => void;
  onRemoveBookmark: (id: string) => void;
}) {
  const isKit = item.type === "kit";
  const isConfirming = isKit
    ? confirmRemoveId === item.id
    : confirmBookmarkId === item.id;

  const surahRef = item.ayat
    ? `${item.ayat.surahName.toUpperCase()}:${item.ayat.verseNumber}`
    : `${item.key}:${item.verseNumber}`;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderRadius: 20,
        padding: "24px 28px 20px",
        border: "1px solid var(--border-card)",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* Top row: surah ref + dot + date */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--fg-subtle)",
            }}
          >
            {surahRef}
          </span>
          {/* dot indicator: green = kit, red = bookmark */}
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: isKit ? "var(--green)" : "#e74c3c",
              display: "inline-block",
            }}
          />
        </div>
        {item.savedAt && (
          <span
            style={{
              fontSize: 10,
              color: "var(--fg-subtle)",
              letterSpacing: "0.06em",
            }}
          >
            {new Date(item.savedAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      {/* Translation */}
      {item.ayat ? (
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "clamp(16px, 2vw, 20px)",
            fontWeight: 400,
            color: "var(--fg)",
            lineHeight: 1.5,
            marginBottom: 16,
          }}
        >
          "{item.ayat.textTranslation}"
        </p>
      ) : (
        <p
          style={{
            fontSize: 14,
            color: "var(--fg-muted)",
            marginBottom: 16,
          }}
        >
          📖 {item.key}:{item.verseNumber}
        </p>
      )}

      {/* Note box — only for kit items that have a note */}
      {isKit && item.ayat && (
        <div style={{ marginBottom: 16 }}>
          <NotePanel
            surahNumber={item.ayat.surahNumber}
            verseNumber={item.ayat.verseNumber}
            
          />
        </div>
      )}

      {/* Bottom row: type label + delete */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 12,
          borderTop: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--fg-subtle)",
          }}
        >
          {isKit ? "Collection" : "Bookmark"}
        </span>

        {isConfirming ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "var(--fg-muted)" }}>Remove?</span>
            <button
              onClick={() =>
                isKit ? setConfirmRemoveId(null) : setConfirmBookmarkId(null)
              }
              style={{
                fontSize: 11,
                color: "var(--fg-muted)",
                background: "transparent",
                border: "0.5px solid var(--border)",
                borderRadius: 6,
                padding: "3px 10px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() =>
                isKit ? onRemoveKit(item.id) : onRemoveBookmark(item.id)
              }
              style={{
                fontSize: 11,
                color: "#fff",
                background: "#c0392b",
                border: "none",
                borderRadius: 6,
                padding: "3px 10px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            onClick={() =>
              isKit
                ? setConfirmRemoveId(item.id)
                : setConfirmBookmarkId(item.id)
            }
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#e74c3c",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}