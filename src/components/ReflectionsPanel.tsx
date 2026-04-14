"use client";

/**
 * components/ReflectionsPanel.tsx
 *
 * Shows public QuranReflect community reflections for a given verse.
 * Fetched via /api/reflections (server proxy, client_credentials, no user login needed).
 *
 * Usage inside AyatCard:
 *   <ReflectionsPanel surahNumber={2} verseNumber={255} />
 */

import { useState, useEffect } from "react";

interface Reflection {
  id: number;
  body: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  postTypeName: string;
  author: {
    username: string;
    firstName?: string;
    lastName?: string;
    verified: boolean;
    avatar: string | null;
  } | null;
}

interface Props {
  surahNumber: number;
  verseNumber: number;
}

export default function ReflectionsPanel({ surahNumber, verseNumber }: Props) {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reflections?surah=${surahNumber}&verse=${verseNumber}&limit=3`)
      .then((r) => r.json())
      .then((data) => {
        setReflections(data.data ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(() => setReflections([]))
      .finally(() => setLoading(false));
  }, [surahNumber, verseNumber]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-stone-200" />
              <div className="h-3 w-24 bg-stone-200 rounded" />
            </div>
            <div className="h-3 w-full bg-stone-100 rounded mb-1" />
            <div className="h-3 w-3/4 bg-stone-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (reflections.length === 0) {
    return (
      <p className="text-xs text-stone-400 text-center py-3">
        No community reflections yet for this verse.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reflections.map((r) => (
        <div key={r.id} className="group">
          {/* Author row */}
          <div className="flex items-center gap-2 mb-1.5">
            {r.author?.avatar ? (
              <img
                src={r.author.avatar}
                alt={r.author.username}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[9px] text-emerald-700 font-bold">
                {(r.author?.firstName ?? r.author?.username ?? "?")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <span className="text-[11px] font-medium text-stone-600">
              {r.author?.firstName
                ? `${r.author.firstName}${r.author.lastName ? " " + r.author.lastName : ""}`
                : r.author?.username ?? "Anonymous"}
            </span>
            {r.author?.verified && (
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                className="text-emerald-500 flex-shrink-0"
              >
                <circle cx="5" cy="5" r="5" fill="currentColor" opacity="0.15" />
                <path
                  d="M3 5l1.5 1.5L7 3.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {/* Post type badge */}
            <span
              className={`ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${
                r.postTypeName === "lesson"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-violet-50 text-violet-600"
              }`}
            >
              {r.postTypeName === "lesson" ? "📖 Lesson" : "💭 Reflection"}
            </span>
          </div>

          {/* Body */}
          <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
            {r.body}
          </p>

          {/* Engagement */}
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] text-stone-400 flex items-center gap-1">
              <svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor" className="opacity-60">
                <path d="M4.5 1C2.567 1 1 2.343 1 4c0 .9.42 1.71 1.09 2.28L1.5 8l1.68-.84A4.1 4.1 0 004.5 7C6.433 7 8 5.657 8 4S6.433 1 4.5 1z"/>
              </svg>
              {r.commentsCount}
            </span>
            <span className="text-[10px] text-stone-400 flex items-center gap-1">
              <svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor" className="opacity-60">
                <path d="M4.5 1.5C2.843 1.5 1.5 2.843 1.5 4.5S2.843 7.5 4.5 7.5 7.5 6.157 7.5 4.5 6.157 1.5 4.5 1.5zm0 1l.95 1.92 2.12.31-1.535 1.495.362 2.11L4.5 7.26l-1.897.995.362-2.11L1.43 4.73l2.12-.31L4.5 2.5z"/>
              </svg>
              {r.likesCount}
            </span>
            <span className="ml-auto text-[10px] text-stone-300">
              {new Date(r.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      ))}

      {/* Link to more on QuranReflect */}
      {total > 3 && (
        <a
          href={`https://quranreflect.com/ayahs/${surahNumber}:${verseNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
        >
          See all {total} reflections on QuranReflect
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 4.5h5M5 2.5l2 2-2 2"/>
          </svg>
        </a>
      )}
    </div>
  );
}