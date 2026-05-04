"use client";

import { useState } from "react";
import AyatCard from "@/components/AyatCard";
import StreakBadge from "@/components/StreakBadge";
import { getSituationBySlug } from "@/lib/situations";
import { getAyatsBySituation } from "@/lib/quranapi";
import { extractSituationSlug } from "@/components/StorySearch";
import { isBookmarked } from "@/lib/storage";
import { Ayat } from "@/types";

type SearchState = "idle" | "searching" | "done" | "error";

const MOODS = [
  { label: "😢 Sad",         text: "I feel really sad and lost" },
  { label: "😰 Anxious",     text: "I am feeling anxious and overwhelmed" },
  { label: "🙏 Grateful",    text: "I feel grateful today, alhamdulillah" },
  { label: "😤 Angry",       text: "I feel angry and frustrated" },
  { label: "💔 Heartbroken", text: "I am heartbroken" },
  { label: "🌙 Distant",     text: "I feel distant from Allah" },
];

export default function Home() {
  const [story, setStory]                   = useState("");
  const [searchState, setSearchState]       = useState<SearchState>("idle");
  const [storyResults, setStoryResults]     = useState<Ayat[]>([]);
  const [matchedSituation, setMatchedSituation] = useState<{
    title: string;
    emoji: string;
  } | null>(null);
  const [bookmarkedIds, setBookmarkedIds]   = useState<number[]>([]);
  const [streakKey, setStreakKey]           = useState(0);
  const [firstAyat, setFirstAyat]          = useState<{
    surahNumber: number;
    verseNumber: number;
  } | undefined>();

  const handleSearch = async () => {
    const trimmed = story.trim();
    if (!trimmed || searchState === "searching") return;

    setSearchState("searching");
    setStoryResults([]);
    setMatchedSituation(null);

    try {
      const slug      = extractSituationSlug(trimmed);
      const situation = getSituationBySlug(slug);
      if (!situation) throw new Error("Situation not found");

      setMatchedSituation({ title: situation.title, emoji: situation.emoji });

      const ayats = await getAyatsBySituation(situation.searchQuery, 15);
      const bIds  = ayats.filter((a) => isBookmarked(a.id)).map((a) => a.id);

      setBookmarkedIds(bIds);
      setStoryResults(ayats);

      if (ayats.length > 0) {
        setFirstAyat({
          surahNumber: ayats[0].surahNumber,
          verseNumber: ayats[0].verseNumber,
        });
      }

      setSearchState("done");
      setStreakKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      setSearchState("error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSearch();
  };

  const handleReset = () => {
    setSearchState("idle");
    setStoryResults([]);
    setMatchedSituation(null);
    setStory("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "64px 56px 80px",
        maxWidth: "var(--content-max)",
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section style={{ marginBottom: 52 }}>
        <h1 className="hero__title" style={{ marginBottom: 16 }}>
          Peace<br />
          <span className="hero__title-italic">within yourself.</span>
        </h1>
        <p className="hero__sub">
          Pour out your heart's burdens, find guidance in every verse that
          shades the soul.
        </p>
      </section>

      {/* ── Streak ─────────────────────────────────────────────── */}
      {(streakKey > 0 || searchState === "idle") && (
        <section style={{ marginBottom: 28 }}>
          <StreakBadge
            key={streakKey}
            record={streakKey > 0}
            firstAyat={firstAyat}
          />
        </section>
      )}

      {/* ── Search box ─────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <div className="search-box">
          {/* Textarea */}
          <textarea
            className="search-box__textarea"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={searchState === "searching" || searchState === "done"}
            placeholder="Tonight, my soul feels…"
            rows={5}
          />

          {/* Mood chips — only when idle */}
          {searchState === "idle" && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                padding: "12px 28px 0",
              }}
            >
              {MOODS.map((mood) => (
                <button
                  key={mood.label}
                  className="mood-chip"
                  onClick={() => setStory(mood.text)}
                >
                  {mood.label}
                </button>
              ))}
            </div>
          )}

          {/* Footer bar */}
          <div className="search-box__footer">
            {/* Left label */}
            <div className="search-box__label">
              {searchState === "idle" && (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="6" cy="6" r="5" />
                    <path d="M6 4v3M6 8.5v.5" />
                  </svg>
                  Reflection space
                </>
              )}

              {searchState === "searching" && (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "flex", gap: 4 }}>
                    {[0, 140, 280].map((d) => (
                      <span
                        key={d}
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: "var(--fg-muted)",
                          display: "inline-block",
                          animation: "bounce 0.9s infinite",
                          animationDelay: `${d}ms`,
                        }}
                      />
                    ))}
                  </span>
                  Searching for verses…
                </span>
              )}

              {searchState === "done" && matchedSituation && (
                <span style={{ color: "var(--fg-muted)" }}>
                  {matchedSituation.emoji}{" "}
                  <strong style={{ color: "var(--fg)", fontWeight: 500 }}>
                    {matchedSituation.title}
                  </strong>
                  {" "}· {storyResults.length} verses
                </span>
              )}

              {searchState === "error" && (
                <span style={{ color: "#c0392b", fontSize: 12 }}>
                  Something went wrong — please try again.
                </span>
              )}
            </div>

            {/* Right CTA */}
            {searchState === "idle" && (
              <button
                className="btn btn--primary"
                onClick={handleSearch}
                disabled={!story.trim()}
              >
                Listen to FindMyAyat
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M2 7h9M7.5 2.5 12 7l-4.5 4.5" />
                </svg>
              </button>
            )}

            {(searchState === "done" || searchState === "error") && (
              <button
                className="btn btn--ghost"
                onClick={handleReset}
                style={{ fontSize: 13 }}
              >
                Search again
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Results ────────────────────────────────────────────── */}
      {searchState === "done" && storyResults.length > 0 && (
        <section>
          {/* Section divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 32,
            }}
          >
            <span className="section-label">Verses for your story</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span className="section-label">
              {matchedSituation?.emoji} {matchedSituation?.title}
            </span>
          </div>

          {/* Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {storyResults.map((ayat) => (
              <AyatCard
                key={ayat.id}
                ayat={ayat}
                isBookmarked={bookmarkedIds.includes(ayat.id)}
              />
            ))}
          </div>
        </section>
      )}

      {searchState === "done" && storyResults.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--fg-muted)",
          }}
        >
          <p style={{ fontSize: 32, marginBottom: 10 }}>🔍</p>
          <p style={{ fontSize: 14 }}>
            No verses found. Try describing your feelings differently.
          </p>
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer
        style={{
          marginTop: 80,
          paddingTop: 24,
          borderTop: "1px solid var(--border)",
        }}
      >
        <p
          className="sidebar__copy"
          style={{ textAlign: "center", lineHeight: 2 }}
        >
          © 2025 FindMyAyat · Verses for the Heart
        </p>
      </footer>

      {/* Bounce keyframes */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}