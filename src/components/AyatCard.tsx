"use client";

import { useState, useRef, useEffect } from "react";
import { Ayat } from "@/types";

interface Props {
  ayat: Ayat;
  isBookmarked?: boolean;
  isInKit?: boolean;
  hideActions?: boolean;
}

export default function AyatCard({
  ayat,
  isBookmarked = false,
  isInKit = false,
  hideActions = false,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
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
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "#FFFFFF",
        border: "0.5px solid #E8E2D6",
      }}
    >
      {/* Toast notification */}
      {(error || successMsg) && (
        <div
          className="fixed bottom-6 left-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-semibold"
          style={{
            transform: "translateX(-50%)",
            background: error ? "#3a1010" : "#1C4F3A",
            color: error ? "#ffcccc" : "#d4edda",
            whiteSpace: "nowrap",
          }}
        >
          <span>{error ? "⚠️" : "✓"}</span>
          <span>{error || successMsg}</span>
        </div>
      )}

      <div className="p-5 pb-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <span
            className="inline-flex items-center text-[11px] font-semibold px-3 py-1.5 rounded-full"
            style={{
              background: "#1C4F3A",
              color: "#FFFFFF",
              letterSpacing: "0.04em",
            }}
          >
            📖 {ayat.surahName} · {ayat.surahNumber}:{ayat.verseNumber}
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggleAudio}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: isPlaying ? "#1C4F3A" : "transparent",
                border: "0.5px solid #E8E2D6",
                color: isPlaying ? "#FFFFFF" : "#1C4F3A",
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
                  background: bookmarked ? "#1C4F3A" : "transparent",
                  border: "0.5px solid #E8E2D6",
                  color: bookmarked ? "#FFFFFF" : "#6B6B5E",
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
          className="mb-4 px-3 py-2"
          style={{ borderRight: "2px solid #E8E2D6" }}
        >
          <p
            className="text-right"
            dir="rtl"
            style={{
              fontFamily: "'Amiri', serif",
              fontSize: "clamp(20px, 4vw, 26px)",
              lineHeight: "2.2",
              color: "#1A1A1A",
            }}
          >
            {ayat.textArabic}
          </p>
        </div>

        {/* Translation */}
        <p
          className="text-sm leading-relaxed"
          style={{
            color: "#6B6B5E",
            fontStyle: "italic",
            lineHeight: "1.7",
            fontFamily: "'Georgia', serif",
          }}
        >
          "{ayat.textTranslation}"
        </p>

        {/* Audio progress bar */}
        {isPlaying && (
          <div
            className="mt-3 h-0.5 rounded-full overflow-hidden"
            style={{ background: "#E8E2D6" }}
          >
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${audioProgress}%`,
                background: "#1C4F3A",
              }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      {!hideActions && (
        <div
          className="flex items-center justify-end px-5 py-3 border-t"
          style={{ borderColor: "#E8E2D6" }}
        >
          <button
            onClick={handleAddToKit}
            disabled={kitAdded || kitLoading}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
            style={
              kitAdded
                ? {
                    background: "transparent",
                    color: "#1C4F3A",
                    border: "0.5px solid #E8E2D6",
                  }
                : {
                    background: "#1C4F3A",
                    color: "#FFFFFF",
                    border: "0.5px solid #1C4F3A",
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
        </div>
      )}
    </div>
  );
}