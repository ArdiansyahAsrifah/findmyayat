"use client";

import { useState, useRef, useEffect } from "react";
import { Ayat } from "@/types";
import ReflectionsPanel from "@/components/ReflectionsPanel";

interface Props {
  ayat: Ayat;
  onBookmark?: (ayat: Ayat) => void;
  onAddToKit?: (ayat: Ayat) => void;
  isBookmarked?: boolean;
  isAiMatched?: boolean;
}

export default function AyatCard({
  ayat,
  onBookmark,
  onAddToKit,
  isBookmarked = false,
  isAiMatched = false,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [showReflections, setShowReflections] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [kitAdded, setKitAdded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setBookmarked(isBookmarked);
  }, [isBookmarked]);

  const toggleAudio = () => {
    if (!isMounted) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(ayat.audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => {
        setIsPlaying(false);
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

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    onBookmark?.(ayat);
  };

  const handleAddToKit = () => {
    if (kitAdded) return;
    setKitAdded(true);
    onAddToKit?.(ayat);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden hover:border-stone-200 hover:shadow-sm transition-all duration-200">
      {/* Main grid: content | sidebar */}
      <div className="grid grid-cols-[1fr_auto]">

        {/* ── Left: main content ── */}
        <div className="p-5">
          {/* Badges row */}
          <div className="flex items-center flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
              {ayat.surahName} • {ayat.surahNumber}:{ayat.verseNumber}
            </span>
            {isAiMatched && (
              <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="inline">
                  <path d="M5 1l1.12 2.27L9 4l-2.88.73L5 9 3.88 4.73 1 4l2.88-.73L5 1z" fill="currentColor"/>
                </svg>
                AI matched
              </span>
            )}
          </div>

          {/* Arabic */}
          <p
            className="text-right text-[22px] leading-[2] text-stone-800 mb-3"
            dir="rtl"
            style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
          >
            {ayat.textArabic}
          </p>

          {/* Translation */}
          <p className="text-stone-500 text-sm leading-relaxed italic">
            &ldquo;{ayat.textTranslation}&rdquo;
          </p>
        </div>

        {/* ── Right: sidebar ── */}
        <div className="flex flex-col items-center justify-between px-3 py-4 border-l border-stone-100 min-w-[52px]">
          <span className="text-[10px] text-stone-400 font-medium text-center leading-snug">
            {ayat.surahNumber}
            <br />
            <span className="text-stone-300">:</span>
            <br />
            {ayat.verseNumber}
          </span>

          <div className="flex flex-col gap-2">
            {/* Play */}
            <button
              onClick={toggleAudio}
              title={isPlaying ? "Pause" : "Listen"}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-150 ${
                isPlaying
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "bg-stone-50 border-stone-200 text-stone-400 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600"
              }`}
            >
              {isPlaying ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <rect x="2" y="2" width="3" height="8" rx="1"/>
                  <rect x="7" y="2" width="3" height="8" rx="1"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M3 2.5l7 3.5-7 3.5V2.5z"/>
                </svg>
              )}
            </button>

            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              title={bookmarked ? "Remove bookmark" : "Bookmark"}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-150 ${
                bookmarked
                  ? "bg-amber-50 border-amber-200 text-amber-500"
                  : "bg-stone-50 border-stone-200 text-stone-400 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-500"
              }`}
            >
              {bookmarked ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M2 2a1 1 0 011-1h6a1 1 0 011 1v9l-4-2.5L2 11V2z"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 2a1 1 0 011-1h6a1 1 0 011 1v9l-4-2.5L2 11V2z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Tafsir panel ── */}
      {showTafsir && ayat.tafsir && (
        <div className="px-5 py-4 bg-stone-50 border-t border-stone-100">
          <p className="text-stone-500 text-xs leading-relaxed">
            {ayat.tafsir}
            {ayat.tafsir.length >= 390 && (
              <span className="text-stone-400">…</span>
            )}
          </p>
        </div>
      )}

      {/* ── Community Reflections panel ── */}
      {showReflections && (
        <div className="px-5 py-4 bg-violet-50/40 border-t border-violet-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-semibold text-violet-600 uppercase tracking-wider">
              Community Reflections
            </span>
            <div className="flex-1 h-px bg-violet-100" />
            <span className="text-[10px] text-violet-400">via QuranReflect</span>
          </div>
          <ReflectionsPanel
            surahNumber={ayat.surahNumber}
            verseNumber={ayat.verseNumber}
          />
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center gap-2 px-5 py-2.5 border-t border-stone-100 flex-wrap">
        {/* Tafsir toggle */}
        {ayat.tafsir ? (
          <button
            onClick={() => setShowTafsir(!showTafsir)}
            className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="currentColor"
              className={`transition-transform duration-200 ${showTafsir ? "rotate-180" : ""}`}
            >
              <path d="M1 3l4 4 4-4"/>
            </svg>
            {showTafsir ? "Hide tafsir" : "View tafsir"}
          </button>
        ) : (
          <span className="text-xs text-stone-300">No tafsir</span>
        )}

        {/* Reflections toggle — new! */}
        <button
          onClick={() => setShowReflections(!showReflections)}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            showReflections
              ? "text-violet-600"
              : "text-stone-400 hover:text-violet-600"
          }`}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="opacity-70">
            <path d="M5 1C2.79 1 1 2.567 1 4.5c0 1.05.48 1.99 1.24 2.65L1.5 9l2.1-1.05A4.6 4.6 0 005 8C7.21 8 9 6.433 9 4.5S7.21 1 5 1z"/>
          </svg>
          {showReflections ? "Hide reflections" : "Community reflections"}
        </button>

        {/* Add to Kit */}
        <button
          onClick={handleAddToKit}
          className={`ml-auto flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-150 ${
            kitAdded
              ? "bg-violet-50 border-violet-200 text-violet-600 cursor-default"
              : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600"
          }`}
        >
          {kitAdded ? (
            <>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
              Added to Kit
            </>
          ) : (
            <>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M5 2v6M2 5h6"/>
              </svg>
              Add to Kit
            </>
          )}
        </button>
      </div>
    </div>
  );
}