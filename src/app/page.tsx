"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import SituationCard from "@/components/SituationCard";
import AyatCard from "@/components/AyatCard";
import { categories, getSituationsByCategory, getSituationBySlug } from "@/lib/situations";
import { getAyatsBySituation } from "@/lib/quranapi";
import { extractSituationSlug } from "@/components/StorySearch";
import {
  addBookmark,
  removeBookmark,
  isBookmarked,
  addToKit,
} from "@/lib/storage";
import { Ayat } from "@/types";

// ✅ FIXED: keys now match the English category strings in situations.ts
const categoryEmojis: Record<string, string> = {
  "Pressure & Anxiety": "😰",
  "Relationships": "💔",
  "Career & Study": "📉",
  "Health & Loss": "🏥",
  "Spiritual": "🙏",
  "Financial": "💰",
};

const categoryLabels: Record<string, string> = {
  "Pressure & Anxiety": "Anxiety & Pressure",
  "Relationships": "Relationships",
  "Career & Study": "Career & Studies",
  "Health & Loss": "Health & Loss",
  "Spiritual": "Spiritual",
  "Financial": "Financial",
};

type SearchState = "idle" | "searching" | "done" | "error";

export default function Home() {
  const [story, setStory] = useState("");
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [storyResults, setStoryResults] = useState<Ayat[]>([]);
  const [matchedSituation, setMatchedSituation] = useState<{ title: string; emoji: string } | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);

  const handleStorySearch = async () => {
    const trimmed = story.trim();
    if (!trimmed || searchState === "searching") return;

    setSearchState("searching");
    setStoryResults([]);
    setMatchedSituation(null);

    try {
      // 1. Map the story to the most relevant situation slug
      const slug = extractSituationSlug(trimmed);

      // 2. Get that situation's proven searchQuery
      const situation = getSituationBySlug(slug);
      if (!situation) throw new Error("Situation not found");

      setMatchedSituation({ title: situation.title, emoji: situation.emoji });

      // 3. Fetch ayats using the curated searchQuery (same as situation pages)
      const ayats = await getAyatsBySituation(situation.searchQuery, 5);

      const bIds = ayats.filter((a) => isBookmarked(a.id)).map((a) => a.id);
      setBookmarkedIds(bIds);
      setStoryResults(ayats);
      setSearchState("done");
    } catch (err) {
      console.error(err);
      setSearchState("error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleStorySearch();
    }
  };

  const handleBookmark = (ayat: Ayat) => {
    if (isBookmarked(ayat.id)) {
      removeBookmark(ayat.id);
      setBookmarkedIds((prev) => prev.filter((id) => id !== ayat.id));
    } else {
      addBookmark(ayat);
      setBookmarkedIds((prev) => [...prev, ayat.id]);
    }
  };

  const handleAddToKit = (ayat: Ayat) => {
    addToKit(
      ayat,
      matchedSituation?.title ?? "My Story",
      matchedSituation?.emoji ?? "✍️",
      "story"
    );
  };

  const handleReset = () => {
    setSearchState("idle");
    setStoryResults([]);
    setMatchedSituation(null);
    setStory("");
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-8 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span>✨</span>
            <span>Every situation has its verse</span>
          </div>
          <h1 className="text-4xl font-bold text-stone-800 mb-4 leading-tight">
            What are you feeling <br />
            <span className="text-emerald-600">today?</span>
          </h1>
          <p className="text-stone-500 text-base leading-relaxed">
            Tell your story or pick a situation — find the verse that speaks
            to your heart.
          </p>
        </div>
      </section>

      {/* Story Search */}
      <section className="max-w-2xl mx-auto px-4 pb-10">
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="p-5">
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={searchState === "searching" || searchState === "done"}
              placeholder="Describe what you're going through... e.g. 'I failed at work today and I feel really sad and lost.'"
              className="w-full bg-transparent border-none outline-none resize-none text-sm text-stone-700 placeholder:text-stone-300 leading-relaxed min-h-[88px] disabled:opacity-60"
            />
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-stone-100 bg-stone-50 min-h-[48px]">
            {searchState === "idle" && (
              <>
                <span className="text-xs text-stone-400">⌘ + Enter to search</span>
                <button
                  onClick={handleStorySearch}
                  disabled={!story.trim()}
                  className="flex items-center gap-2 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Find verses
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
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </span>
                <span className="text-xs text-stone-500">Searching for verses...</span>
              </div>
            )}

            {(searchState === "done" || searchState === "error") && (
              <div className="flex items-center justify-between w-full gap-3">
                {searchState === "done" ? (
                  <span className="text-xs text-stone-500 flex items-center gap-1.5">
                    {matchedSituation && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-medium">
                        {matchedSituation.emoji} {matchedSituation.title}
                      </span>
                    )}
                    <span>{storyResults.length} verses found</span>
                  </span>
                ) : (
                  <span className="text-xs text-red-400">
                    Something went wrong. Check your connection and try again.
                  </span>
                )}
                <button
                  onClick={handleReset}
                  className="text-xs text-stone-400 hover:text-stone-600 transition-colors underline underline-offset-2 whitespace-nowrap"
                >
                  Search again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {searchState === "done" && storyResults.length > 0 && (
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider whitespace-nowrap">
                Verses for your story
              </span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>
            {storyResults.map((ayat) => (
              <AyatCard
                key={ayat.id}
                ayat={ayat}
                isAiMatched
                isBookmarked={bookmarkedIds.includes(ayat.id)}
                onBookmark={handleBookmark}
                onAddToKit={handleAddToKit}
              />
            ))}
          </div>
        )}

        {searchState === "done" && storyResults.length === 0 && (
          <div className="mt-4 text-center py-10 text-stone-400">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm">No verses found. Try describing your feelings differently.</p>
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-4 flex items-center gap-4 pb-8">
        <div className="flex-1 h-px bg-stone-200" />
        <span className="text-xs text-stone-400 font-medium">or browse by situation</span>
        <div className="flex-1 h-px bg-stone-200" />
      </div>
      {/* Footer */}
      <footer className="text-center py-8 text-stone-400 text-xs border-t border-stone-100 bg-white">
        <p className="mb-1">FindMyAyat</p>
        <p>
          Powered by{" "}
          <span className="text-emerald-500">Quran Foundation API</span>
        </p>
      </footer>
    </div>
  );
}