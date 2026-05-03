"use client";

import { useEffect, useState } from "react";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

interface StreakBadgeProps {
  record?: boolean;
  firstAyat?: { surahNumber: number; verseNumber: number };
}

export default function StreakBadge({ record = false, firstAyat }: StreakBadgeProps) {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [justRecorded, setJustRecorded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (record) {
      postAndFetch(firstAyat);
    } else {
      fetchOnly();
    }
  }, [record, firstAyat]);

  async function fetchOnly() {
    try {
      const res = await fetch("/api/streak");
      if (!res.ok) return;
      const data = await res.json();
      if (data.streak) setStreak(normalize(data.streak));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function postAndFetch(ayat?: { surahNumber: number; verseNumber: number }) {
    try {
      const res = await fetch("/api/streak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surahNumber: ayat?.surahNumber ?? 1,
          verseNumber: ayat?.verseNumber ?? 1,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.streak) {
        setStreak(normalize(data.streak));
        setJustRecorded(true);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  function normalize(raw: any): StreakData {
    return {
      currentStreak: raw?.days ?? raw?.currentStreak ?? raw?.current_streak ?? raw?.streak ?? 0,
      longestStreak: raw?.longestStreak ?? raw?.longest_streak ?? raw?.best ?? raw?.days ?? 0,
    };
  }

  if (loading || !streak) return null;

  return (
    <div
      className="rounded-2xl px-5 py-4"
      style={{
        background: "#FFFFFF",
        border: "0.5px solid #E8E2D6",
      }}
    >
      {justRecorded && (
        <p className="text-xs font-medium mb-2" style={{ color: "#1C4F3A" }}>
          ✨ Refleksi hari ini tercatat!
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-base font-bold" style={{ color: "#1A1A1A" }}>
              {streak.currentStreak}{" "}
              <span className="font-normal text-sm" style={{ color: "#6B6B5E" }}>
                day streak
              </span>
            </p>
            <p className="text-xs" style={{ color: "#6B6B5E" }}>
              Longest: {streak.longestStreak} day
            </p>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: i < Math.min(streak.currentStreak, 7) ? "#1C4F3A" : "#E8E2D6",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}