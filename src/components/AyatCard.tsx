"use client";

import { useState, useRef, useEffect } from "react";
import { Ayat } from "@/types";
import ReflectionsPanel from "@/components/ReflectionsPanel";
import NotePanel from "@/components/NotePanel";

interface Props {
  ayat: Ayat;
  isBookmarked?: boolean;
  isAiMatched?: boolean;
  isInKit?: boolean;
  hideActions?: boolean;
}

export default function AyatCard({
  ayat,
  isBookmarked = false,
  isInKit = false,
  isAiMatched = false,
  hideActions = false,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReflections, setShowReflections] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [kitAdded, setKitAdded] = useState(isInKit);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [kitLoading, setKitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => setBookmarked(isBookmarked), [isBookmarked]);
  useEffect(() => setKitAdded(isInKit), [isInKit]);

  useEffect(() => {
    if (successMsg || error) {
      const t = setTimeout(() => {
        setSuccessMsg(null);
        setError(null);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [successMsg, error]);

  const toggleAudio = () => {
    if (!isMounted) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(ayat.audioUrl);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setAudioProgress(0);
      };
      audioRef.current.onerror = () => setIsPlaying(false);
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          const progress =
            (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setAudioProgress(isNaN(progress) ? 0 : progress);
        }
      };
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const handleBookmark = async () => {
    if (bookmarkLoading) return;
    setError(null);
    setSuccessMsg(null);
    setBookmarkLoading(true);
    try {
      if (!bookmarked) {
        const res = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            surahNumber: ayat.surahNumber,
            verseNumber: ayat.verseNumber,
          }),
        });
        if (!res.ok) throw new Error("Failed to bookmark");
        setBookmarked(true);
        setSuccessMsg("Saved to bookmarks");
      } else {
        setBookmarked(false);
        setSuccessMsg("Removed from bookmarks");
      }
    } catch {
      setError("Please login first to use bookmarks");
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleAddToKit = async () => {
    if (kitAdded || kitLoading) return;
    setError(null);
    setSuccessMsg(null);
    setKitLoading(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surahNumber: ayat.surahNumber,
          verseNumber: ayat.verseNumber,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setKitAdded(true);
      setSuccessMsg("Added to your Kit");
    } catch {
      setError("Failed to add to kit");
    } finally {
      setKitLoading(false);
    }
  };

  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: "linear-gradient(135deg, #faf9f7 0%, #f5f2ec 100%)",
        border: "1px solid rgba(180, 160, 120, 0.2)",
        boxShadow:
          "0 2px 8px rgba(120, 100, 60, 0.06), 0 1px 2px rgba(120, 100, 60, 0.04)",
      }}
    >
      {/* Top decorative border */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(139, 111, 67, 0.4), rgba(180, 140, 80, 0.6), rgba(139, 111, 67, 0.4), transparent)",
        }}
      />

      {/* Subtle geometric pattern overlay */}
      <div
        className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 0 L32 16 L16 32 L0 16 Z' fill='none' stroke='%23000' stroke-width='1'/%3E%3Cpath d='M16 8 L24 16 L16 24 L8 16 Z' fill='none' stroke='%23000' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Toast notification */}
      {(error || successMsg) && (
        <div
          className="fixed bottom-6 left-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-semibold shadow-xl"
          style={{
            transform: "translateX(-50%)",
            animation:
              "toastSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards",
            background: error
              ? "linear-gradient(135deg, #3a1010, #5a1a1a)"
              : "linear-gradient(135deg, #0f2d1a, #1a4a2e)",
            color: error ? "#ffcccc" : "#c8f0d8",
            border: error
              ? "1px solid rgba(255,100,100,0.2)"
              : "1px solid rgba(100,220,140,0.2)",
            backdropFilter: "blur(12px)",
            boxShadow: error
              ? "0 8px 32px rgba(180,40,40,0.25), 0 2px 8px rgba(0,0,0,0.2)"
              : "0 8px 32px rgba(30,100,60,0.25), 0 2px 8px rgba(0,0,0,0.2)",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: "14px" }}>{error ? "⚠️" : "✓"}</span>
          <span>{error || successMsg}</span>
          <style>{`
            @keyframes toastSlideUp {
              from { opacity: 0; transform: translateX(-50%) translateY(12px); }
              to   { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
          `}</style>
        </div>
      )}

      <div className="p-5 pb-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center flex-wrap gap-2">
            <span
              className="inline-flex items-center text-[11px] font-bold px-3 py-1.5 rounded-full tracking-wide"
              style={{
                background: "linear-gradient(135deg, #2d5a3d, #3d7a52)",
                color: "#d4edda",
                letterSpacing: "0.05em",
              }}
            >
              {ayat.surahName} · {ayat.surahNumber}:{ayat.verseNumber}
            </span>

            {isAiMatched && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #f0ebff, #e8e0ff)",
                  color: "#6040b0",
                  border: "1px solid rgba(100,60,180,0.15)",
                }}
              >
                ✦ AI matched
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggleAudio}
              className="relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: isPlaying
                  ? "linear-gradient(135deg, #2d5a3d, #3d7a52)"
                  : "rgba(45, 90, 61, 0.08)",
                border: isPlaying
                  ? "1px solid rgba(45,90,61,0.3)"
                  : "1px solid rgba(45,90,61,0.15)",
                color: isPlaying ? "#d4edda" : "#2d5a3d",
              }}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                  <rect x="0" y="0" width="3.5" height="12" rx="1" />
                  <rect x="6.5" y="0" width="3.5" height="12" rx="1" />
                </svg>
              ) : (
                <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                  <path d="M1 0.5 L9.5 6 L1 11.5 Z" />
                </svg>
              )}
            </button>

            {!hideActions && (
              <button
                onClick={handleBookmark}
                disabled={bookmarkLoading}
                className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: bookmarked
                    ? "linear-gradient(135deg, #8b6f43, #a8843a)"
                    : "rgba(139, 111, 67, 0.08)",
                  border: bookmarked
                    ? "1px solid rgba(139,111,67,0.3)"
                    : "1px solid rgba(139,111,67,0.15)",
                  color: bookmarked ? "#fef3d0" : "#8b6f43",
                }}
                title={bookmarked ? "Remove bookmark" : "Bookmark"}
              >
                {bookmarkLoading ? (
                  <svg className="animate-spin" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 1 A4 4 0 0 1 9 5" />
                  </svg>
                ) : (
                  <svg width="10" height="13" viewBox="0 0 10 13" fill="currentColor">
                    <path d="M1 1 H9 V12 L5 9 L1 12 Z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Arabic text */}
        <div
          className="mb-4 px-1 py-2"
          style={{ borderRight: "3px solid rgba(139, 111, 67, 0.3)" }}
        >
          <p
            className="text-right leading-[2.2] text-stone-800"
            dir="rtl"
            style={{
              fontFamily: "'Scheherazade New', 'KFGQPC Uthmanic Script', serif",
              fontSize: "clamp(18px, 4vw, 24px)",
              lineHeight: "2.2",
              color: "#2a2015",
              textShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            {ayat.textArabic}
          </p>
        </div>

        {/* Translation */}
        <p
          className="text-sm leading-relaxed"
          style={{
            color: "#786040",
            fontStyle: "italic",
            lineHeight: "1.7",
            fontFamily: "'Georgia', 'Times New Roman', serif",
          }}
        >
          "{ayat.textTranslation}"
        </p>

        {/* Audio progress bar */}
        {isPlaying && (
          <div
            className="mt-3 h-0.5 rounded-full overflow-hidden"
            style={{ background: "rgba(139,111,67,0.15)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${audioProgress}%`,
                background: "linear-gradient(90deg, #2d5a3d, #8b6f43)",
              }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center gap-2 px-5 py-3 border-t flex-wrap"
        style={{ borderColor: "rgba(180, 150, 100, 0.15)" }}
      >
        {/* Reflections toggle */}
        <button
          onClick={() => setShowReflections(!showReflections)}
          className="flex items-center gap-1.5 text-xs font-medium transition-all duration-200 hover:opacity-80"
          style={{ color: "#7060a0" }}
        >
          <span style={{ fontSize: "10px" }}>
            {showReflections ? "▲" : "▼"}
          </span>
          {showReflections ? "Hide reflections" : "Community reflections"}
        </button>

        {/* Tafsir toggle */}
        <button
          onClick={() => setShowTafsir(!showTafsir)}
          className="flex items-center gap-1.5 text-xs font-medium transition-all duration-200 hover:opacity-80"
          style={{ color: "#2d7a52" }}
        >
          <span style={{ fontSize: "10px" }}>
            {showTafsir ? "▲" : "▼"}
          </span>
          {showTafsir ? "Hide tafsir" : "📖 Tafsir"}
        </button>

        {/* Notes toggle */}
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center gap-1.5 text-xs font-medium transition-all duration-200 hover:opacity-80"
          style={{ color: "#a07830" }}
        >
          <span style={{ fontSize: "10px" }}>
            {showNotes ? "▲" : "▼"}
          </span>
          {showNotes ? "Hide notes" : "📝 Notes"}
        </button>

        <div className="flex-1" />

        {/* Add to Kit button */}
        {!hideActions && (
          <button
            onClick={handleAddToKit}
            disabled={kitAdded || kitLoading}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
            style={
              kitAdded
                ? {
                    background: "rgba(45,90,61,0.1)",
                    color: "#2d5a3d",
                    border: "1px solid rgba(45,90,61,0.2)",
                  }
                : {
                    background: "linear-gradient(135deg, #2d5a3d, #3d7a52)",
                    color: "#d4edda",
                    border: "1px solid rgba(45,90,61,0.3)",
                    boxShadow: "0 1px 4px rgba(45,90,61,0.25)",
                  }
            }
          >
            {kitLoading ? (
              <>
                <svg className="animate-spin" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 1 A4 4 0 0 1 9 5" />
                </svg>
                Adding…
              </>
            ) : kitAdded ? (
              <>✓ In Kit</>
            ) : (
              <>+ Add to Kit</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}