"use client";

import { useEffect, useState } from "react";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

interface StreakBadgeProps {
  record?: boolean; // true = POST, false = GET only
}

export default function StreakBadge({ record = false }: StreakBadgeProps) {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [justRecorded, setJustRecorded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (record) {
      postAndFetch();
    } else {
      fetchOnly();
    }
  }, [record]);

  async function fetchOnly() {
    try {
      const res = await fetch("/api/streak");
      if (!res.ok) return; // user belum login → silent
      const data = await res.json();
      if (data.streak) setStreak(normalize(data.streak));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function postAndFetch() {
    try {
      const res = await fetch("/api/streak", { method: "POST" });
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
      currentStreak:
        raw.currentStreak ?? raw.current_streak ?? raw.streak ?? 0,
      longestStreak:
        raw.longestStreak ?? raw.longest_streak ?? raw.best ?? 0,
    };
  }

  // User belum login atau data belum ada → tidak render apapun
  if (loading || !streak) return null;

  return (
    <div
      className={`rounded-2xl border px-5 py-4 transition-all ${
        justRecorded
          ? "bg-amber-50 border-amber-200"
          : "bg-white border-stone-200"
      }`}
    >
      {justRecorded && (
        <p className="text-xs font-medium text-amber-600 mb-2 tracking-wide">
          ✨ Refleksi hari ini tercatat!
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-base font-bold text-stone-800">
              {streak.currentStreak}{" "}
              <span className="font-normal text-stone-500 text-sm">
                hari berturut-turut
              </span>
            </p>
            <p className="text-xs text-stone-400">
              Terpanjang: {streak.longestStreak} hari
            </p>
          </div>
        </div>

        {/* 7-dot streak indicator */}
        <div className="flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${
                i < Math.min(streak.currentStreak, 7)
                  ? "bg-amber-400"
                  : "bg-stone-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}