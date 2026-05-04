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

export default function StreakBadge({
  record = false,
  firstAyat,
}: StreakBadgeProps) {
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

  async function postAndFetch(
    ayat?: { surahNumber: number; verseNumber: number }
  ) {
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
      currentStreak:
        raw?.days ??
        raw?.currentStreak ??
        raw?.current_streak ??
        raw?.streak ??
        0,
      longestStreak:
        raw?.longestStreak ??
        raw?.longest_streak ??
        raw?.best ??
        raw?.days ??
        0,
    };
  }

  if (loading || !streak) return null;

  const activeDots = Math.min(streak.currentStreak, 7);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        background: "#FFFFFF",
        borderRadius: 999,
        padding: "10px 20px 10px 16px",
        boxShadow: "0 2px 16px 0 rgba(30, 28, 24, 0.06)",
      }}
    >
      {/* Flame icon */}
      <span
        style={{
          fontSize: 18,
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        🔥
      </span>

      {/* Label */}
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 12,
          fontWeight: 300,
          color: "var(--fg-muted)",
        }}
      >
        {justRecorded ? "Refleksi tercatat" : "Day streak"}
      </span>

      {/* Count */}
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 20,
          fontWeight: 600,
          color: "var(--fg)",
          letterSpacing: "-0.01em",
          lineHeight: 1,
        }}
      >
        {streak.currentStreak}
      </span>

      {/* Dot indicators — 7 days */}
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: i < activeDots ? "var(--green)" : "var(--border)",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>

      {/* Longest streak — subtle right label */}
      {streak.longestStreak > 0 && (
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 10,
            fontWeight: 400,
            color: "var(--fg-subtle)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            borderLeft: "0.5px solid var(--border)",
            paddingLeft: 12,
            whiteSpace: "nowrap",
          }}
        >
          Best {streak.longestStreak}d
        </span>
      )}
    </div>
  );
}