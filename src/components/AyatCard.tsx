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
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(isInKit);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => setBookmarked(isBookmarked), [isBookmarked]);
  useEffect(() => setSaved(isInKit), [isInKit]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (msg: string, type: "ok" | "err" = "ok") =>
    setToast({ msg, type });

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
          const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setAudioProgress(isNaN(p) ? 0 : p);
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

  const handleLike = () => {
    setLiked((v) => !v);
  };

  const handleBookmark = async () => {
    if (bookmarkLoading) return;
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
        if (!res.ok) throw new Error();
        setBookmarked(true);
        showToast("Saved to bookmarks");
      } else {
        setBookmarked(false);
        showToast("Removed from bookmarks");
      }
    } catch {
      showToast("Please login first", "err");
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleSave = async () => {
    if (saved || saveLoading) return;
    setSaveLoading(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surahNumber: ayat.surahNumber,
          verseNumber: ayat.verseNumber,
        }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      showToast("Wisdom saved");
    } catch {
      showToast("Failed to save", "err");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: toast.type === "err" ? "#2e1010" : "#1E3A2F",
            color: toast.type === "err" ? "#ffcccc" : "#d4ede3",
            padding: "11px 22px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 400,
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--font-body)",
          }}
        >
          <span>{toast.type === "err" ? "⚠" : "✓"}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Card */}
      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: 28,
          padding: "64px 48px 52px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Play button — top right corner, subtle */}
        <button
          onClick={toggleAudio}
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "0.5px solid var(--border)",
            background: isPlaying ? "var(--green)" : "transparent",
            color: isPlaying ? "#fff" : "var(--fg-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.15s, color 0.15s",
          }}
          title={isPlaying ? "Pause" : "Play recitation"}
        >
          {isPlaying ? (
            <svg width="10" height="11" viewBox="0 0 10 11" fill="currentColor">
              <rect x="0" y="0" width="3" height="11" rx="1" />
              <rect x="7" y="0" width="3" height="11" rx="1" />
            </svg>
          ) : (
            <svg width="9" height="11" viewBox="0 0 9 11" fill="currentColor">
              <path d="M0.5 0.5L8.5 5.5L0.5 10.5Z" />
            </svg>
          )}
        </button>

        {/* Audio progress — thin line at very top of card */}
        {isPlaying && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: 2,
              width: `${audioProgress}%`,
              background: "var(--green)",
              borderRadius: "28px 0 0 0",
              transition: "width 0.2s linear",
            }}
          />
        )}

        {/* Arabic text */}
        <p
          dir="rtl"
          style={{
            fontFamily: "var(--font-arabic)",
            fontSize: "clamp(44px, 7.5vw, 76px)",
            lineHeight: 1.9,
            color: "var(--fg)",
            fontWeight: 700,
            marginBottom: 28,
          }}
        >
          {ayat.textArabic}
        </p>

        {/* Divider */}
        <div
          style={{
            width: 44,
            height: 1,
            background: "var(--border)",
            margin: "0 auto 18px",
          }}
        />

        {/* Surah reference */}
        <p
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--fg-subtle)",
            marginBottom: 36,
          }}
        >
          {ayat.surahName} &nbsp;·&nbsp; Ayat {ayat.verseNumber}
        </p>

        {/* Translation */}
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "clamp(20px, 2.6vw, 26px)",
            fontWeight: 400,
            color: "var(--fg)",
            lineHeight: 1.5,
            maxWidth: 580,
            margin: "0 auto 32px",
          }}
        >
          "{ayat.textTranslation}"
        </p>

        {/* Reflection box */}
        {ayat.reflection && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 18,
              padding: "22px 32px",
              fontSize: 13,
              fontWeight: 300,
              color: "var(--fg-muted)",
              fontStyle: "italic",
              lineHeight: 1.8,
              maxWidth: 520,
              margin: "0 auto 48px",
              fontFamily: "var(--font-display)",
            }}
          >
            {ayat.reflection}
          </div>
        )}

        {/* Actions */}
        {!hideActions && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
            }}
          >
            {/* Heart / like */}
            <button
              onClick={handleLike}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "0.5px solid var(--border)",
                background: "transparent",
                color: liked ? "#c0392b" : "var(--fg-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "border-color 0.15s, color 0.15s",
              }}
              title="Like"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              >
                <path d="M8 13.5S1.5 9.5 1.5 5.5a3.5 3.5 0 0 1 6.5-1.8A3.5 3.5 0 0 1 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z" />
              </svg>
            </button>

            {/* Save Wisdom — primary CTA */}
            <button
              onClick={handleSave}
              disabled={saved || saveLoading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: saved ? "var(--fg-muted)" : "var(--fg)",
                color: "#FFFFFF",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontWeight: 400,
                padding: "14px 32px",
                borderRadius: 999,
                border: "none",
                cursor: saved ? "default" : "pointer",
                letterSpacing: "0.01em",
                transition: "opacity 0.15s",
                opacity: saved || saveLoading ? 0.6 : 1,
              }}
            >
              {saveLoading ? (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  >
                    <path d="M7 1 A6 6 0 0 1 13 7" />
                  </svg>
                  Saving…
                </>
              ) : saved ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M2 7l4 4 6-6" />
                  </svg>
                  Wisdom Saved
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="2" y="1" width="10" height="12" rx="2" />
                    <path d="M5 1v5l2-1.5L9 6V1" />
                  </svg>
                  Save Wisdom
                </>
              )}
            </button>

            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "0.5px solid var(--border)",
                background: "transparent",
                color: bookmarked ? "var(--green)" : "var(--fg-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "border-color 0.15s, color 0.15s",
              }}
              title={bookmarked ? "Remove bookmark" : "Bookmark"}
            >
              <svg
                width="13"
                height="16"
                viewBox="0 0 13 16"
                fill={bookmarked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              >
                <path d="M1.5 2h10v13L6.5 11.5 1.5 15V2Z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}