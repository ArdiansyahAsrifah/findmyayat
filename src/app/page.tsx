"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import AyatCard from "@/components/AyatCard";
import StreakBadge from "@/components/StreakBadge";
import { getSituationBySlug } from "@/lib/situations";
import { getAyatsBySituation } from "@/lib/quranapi";
import { extractSituationSlug } from "@/components/StorySearch";
import { addBookmark, removeBookmark, isBookmarked, addToKit } from "@/lib/storage";
import { Ayat } from "@/types";

type SearchState = "idle" | "searching" | "done" | "error";

const MOODS = [
  { label: "😢 Sad", text: "I feel really sad" },
  { label: "😰 Anxious", text: "I am feeling anxious" },
  { label: "🙏 Grateful", text: "I feel grateful today" },
  { label: "😤 Angry", text: "I feel angry" },
  { label: "💔 Heartbroken", text: "I am heartbroken" },
  { label: "🌙 Reflective", text: "I feel distant from Allah" },
];

export default function Home() {
  const [story, setStory] = useState("");
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [storyResults, setStoryResults] = useState<Ayat[]>([]);
  const [matchedSituation, setMatchedSituation] = useState<{ title: string; emoji: string } | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [streakKey, setStreakKey] = useState(0);
  const [firstAyat, setFirstAyat] = useState<{ surahNumber: number; verseNumber: number } | undefined>();

  const handleStorySearch = async () => {
    const trimmed = story.trim();
    if (!trimmed || searchState === "searching") return;
    setSearchState("searching");
    setStoryResults([]);
    setMatchedSituation(null);
    try {
      const slug = extractSituationSlug(trimmed);
      const situation = getSituationBySlug(slug);
      if (!situation) throw new Error("Situation not found");
      setMatchedSituation({ title: situation.title, emoji: situation.emoji });
      const ayats = await getAyatsBySituation(situation.searchQuery, 15);
      const bIds = ayats.filter((a) => isBookmarked(a.id)).map((a) => a.id);
      setBookmarkedIds(bIds);
      setStoryResults(ayats);
      if (ayats.length > 0) {
        setFirstAyat({ surahNumber: ayats[0].surahNumber, verseNumber: ayats[0].verseNumber });
      }
      setSearchState("done");
      setStreakKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      setSearchState("error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleStorySearch();
  };

  const handleReset = () => {
    setSearchState("idle");
    setStoryResults([]);
    setMatchedSituation(null);
    setStory("");
  };

  return (
    <div className="min-h-screen" style={{ background: "#F5F0E8" }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-8 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div
            className="inline-flex items-center gap-2 text-xs font-medium px-4 py-1.5 rounded-full mb-6"
            style={{
              background: "rgba(28, 79, 58, 0.08)",
              color: "#1C4F3A",
              border: "0.5px solid rgba(28, 79, 58, 0.2)",
            }}
          >
            ✦ Every situation has its verse
          </div>

          <h1
            className="font-bold mb-4 leading-tight"
            style={{ fontSize: "clamp(36px, 6vw, 52px)", color: "#1A1A1A" }}
          >
            What are you feeling <br />
            <span
              style={{
                color: "#1C4F3A",
                fontFamily: "'Amiri', Georgia, serif",
                fontStyle: "italic",
              }}
            >
              today?
            </span>
          </h1>

          <p className="text-base leading-relaxed" style={{ color: "#6B6B5E" }}>
            Tell your story or pick a mood — let the words of the Qur'an meet you
            exactly where your heart is.
          </p>
        </div>
      </section>

      {/* Streak */}
      <section className="max-w-2xl mx-auto px-4 pb-4">
        <StreakBadge key={streakKey} record={streakKey > 0} firstAyat={firstAyat} />
      </section>

      {/* Search box */}
      <section className="max-w-2xl mx-auto px-4 pb-10">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#FFFFFF", border: "0.5px solid #E8E2D6" }}
        >
          <div className="p-5">
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={searchState === "searching" || searchState === "done"}
              placeholder="Describe what you're going through... e.g. 'I failed at work today and I feel really lost.'"
              className="w-full bg-transparent border-none outline-none resize-none text-sm leading-relaxed min-h-[88px] disabled:opacity-60"
              style={{ color: "#1A1A1A" }}
            />

            {searchState === "idle" && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-xs" style={{ color: "#6B6B5E" }}>
                  Or pick a mood:
                </span>
                {MOODS.map((mood) => (
                  <button
                    key={mood.label}
                    onClick={() => setStory(mood.text)}
                    className="text-xs px-3 py-1.5 rounded-full transition-opacity hover:opacity-70"
                    style={{
                      border: "0.5px solid #E8E2D6",
                      color: "#6B6B5E",
                      background: "transparent",
                    }}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div
            className="flex items-center justify-between px-5 py-3 border-t min-h-[52px]"
            style={{ borderColor: "#E8E2D6", background: "#FDFAF5" }}
          >
            {searchState === "idle" && (
              <>
                <span className="text-xs" style={{ color: "#6B6B5E" }}>
                  ⌘ K + Enter to search
                </span>
                <button
                  onClick={handleStorySearch}
                  disabled={!story.trim()}
                  className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "#1C4F3A", color: "#FFFFFF" }}
                >
                  ✦ Find verses
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M2 6h8M6 2l4 4-4 4" />
                  </svg>
                </button>
              </>
            )}

            {searchState === "searching" && (
              <div className="flex items-center gap-2 w-full">
                <span className="flex gap-1">
                  {[0, 120, 240].map((delay) => (
                    <span
                      key={delay}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: "#1C4F3A", animationDelay: `${delay}ms` }}
                    />
                  ))}
                </span>
                <span className="text-xs" style={{ color: "#6B6B5E" }}>
                  Searching for verses...
                </span>
              </div>
            )}

            {(searchState === "done" || searchState === "error") && (
              <div className="flex items-center justify-between w-full gap-3">
                {searchState === "done" ? (
                  <span className="text-xs flex items-center gap-1.5" style={{ color: "#6B6B5E" }}>
                    {matchedSituation && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium"
                        style={{ background: "rgba(28,79,58,0.08)", color: "#1C4F3A" }}
                      >
                        {matchedSituation.emoji} {matchedSituation.title}
                      </span>
                    )}
                    · {storyResults.length} verses found
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: "#c0392b" }}>
                    Something went wrong. Check your connection and try again.
                  </span>
                )}
                <button
                  onClick={handleReset}
                  className="text-xs underline underline-offset-2 whitespace-nowrap transition-opacity hover:opacity-70"
                  style={{ color: "#6B6B5E" }}
                >
                  Search again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {searchState === "done" && storyResults.length > 0 && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                style={{ color: "#6B6B5E" }}
              >
                Verses for your story
              </span>
              <div className="flex-1 h-px" style={{ background: "#E8E2D6" }} />
              <span className="text-xs whitespace-nowrap" style={{ color: "#6B6B5E" }}>
                {matchedSituation?.emoji} {matchedSituation?.title} · {storyResults.length} verses found
              </span>
            </div>

            {storyResults.map((ayat) => (
              <AyatCard
                key={ayat.id}
                ayat={ayat}
                isBookmarked={bookmarkedIds.includes(ayat.id)}
              />
            ))}
          </div>
        )}

        {searchState === "done" && storyResults.length === 0 && (
          <div className="mt-4 text-center py-10" style={{ color: "#6B6B5E" }}>
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm">No verses found. Try describing your feelings differently.</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer
        className="text-center py-8 text-xs border-t"
        style={{ borderColor: "#E8E2D6", color: "#6B6B5E" }}
      >
        <p className="mb-1 font-medium" style={{ color: "#1A1A1A" }}>FindMyAyat</p>
        <p style={{ color: "#6B6B5E" }}>Verses for the Heart</p>
      </footer>
    </div>
  );
}