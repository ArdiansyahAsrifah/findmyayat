"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import AyatCard from "@/components/AyatCard";
import Link from "next/link";
import {
  getKit,
  getBookmarks,
  KitItem,
  removeFromKit,
  updateReflection,
  removeBookmark,
  isBookmarked,
  addBookmark,
} from "@/lib/storage";
import { Ayat } from "@/types";

type Tab = "kit" | "bookmarks";

export default function MyKitPage() {
  const [activeTab, setActiveTab] = useState<Tab>("kit");
  const [kit, setKit] = useState<KitItem[]>([]);
  const [bookmarks, setBookmarks] = useState<Ayat[]>([]);
  const [editingReflection, setEditingReflection] = useState<number | null>(null);
  const [reflectionText, setReflectionText] = useState("");

  useEffect(() => {
    setKit(getKit());
    setBookmarks(getBookmarks());
  }, []);

  const handleRemoveFromKit = (ayatId: number) => {
    removeFromKit(ayatId);
    setKit(getKit());
  };

  const handleSaveReflection = (ayatId: number) => {
    updateReflection(ayatId, reflectionText);
    setKit(getKit());
    setEditingReflection(null);
    setReflectionText("");
  };

  const handleBookmark = (ayat: Ayat) => {
    if (isBookmarked(ayat.id)) {
      removeBookmark(ayat.id);
    } else {
      addBookmark(ayat);
    }
    setBookmarks(getBookmarks());
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-20">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-800 mb-1">My Kit</h1>
          <p className="text-stone-500 text-sm">
            Your collection
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("kit")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "kit"
                ? "bg-white text-stone-800 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            📦 Kit ({kit.length})
          </button>
          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "bookmarks"
                ? "bg-white text-stone-800 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            🔖 Bookmark ({bookmarks.length})
          </button>
        </div>

        {/* Kit Tab */}
        {activeTab === "kit" && (
          <div>
            {kit.length === 0 ? (
              <div className="text-center py-20 text-stone-400">
                <p className="text-4xl mb-3">📦</p>
                <p className="text-sm mb-4">Kit kamu masih kosong</p>
                <Link
                  href="/"
                  className="text-emerald-600 text-sm font-medium hover:text-emerald-700"
                >
                  Temukan ayatmu →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {kit.map((item) => (
                  <div key={item.ayat.id}>
                    {/* Situation Label */}
                    <div className="flex items-center gap-2 mb-2">
                      <span>{item.situationEmoji}</span>
                      <Link
                        href={`/situation/${item.situationSlug}`}
                        className="text-xs text-stone-400 hover:text-emerald-600 transition-colors"
                      >
                        {item.situationTitle}
                      </Link>
                    </div>

                    <AyatCard
                      ayat={item.ayat}
                      isBookmarked={isBookmarked(item.ayat.id)}
                    />

                    {/* Reflection Box */}
                    <div className="mt-2 bg-white border border-stone-100 rounded-2xl p-4">
                      {editingReflection === item.ayat.id ? (
                        <div>
                          <textarea
                            className="w-full text-sm text-stone-700 bg-stone-50 rounded-xl p-3 border border-stone-200 resize-none focus:outline-none focus:border-emerald-300"
                            rows={3}
                            placeholder="Tulis refleksimu tentang ayat ini..."
                            value={reflectionText}
                            onChange={(e) => setReflectionText(e.target.value)}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleSaveReflection(item.ayat.id)}
                              className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingReflection(null)}
                              className="text-xs bg-stone-100 text-stone-600 px-3 py-1.5 rounded-lg hover:bg-stone-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingReflection(item.ayat.id);
                            setReflectionText(item.reflection || "");
                          }}
                          className="cursor-pointer"
                        >
                          {item.reflection ? (
                            <p className="text-sm text-stone-600 italic">
                              "{item.reflection}"
                            </p>
                          ) : (
                            <p className="text-xs text-stone-400 hover:text-emerald-500 transition-colors">
                              ✏️ Add personal reflection...
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFromKit(item.ayat.id)}
                      className="mt-1 text-xs text-stone-300 hover:text-red-400 transition-colors"
                    >
                      Hapus dari Kit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookmarks Tab */}
        {activeTab === "bookmarks" && (
          <div>
            {bookmarks.length === 0 ? (
              <div className="text-center py-20 text-stone-400">
                <p className="text-4xl mb-3">🔖</p>
                <p className="text-sm mb-4">Nothing Found</p>
                <Link
                  href="/"
                  className="text-emerald-600 text-sm font-medium hover:text-emerald-700"
                >
                  Search your ayat →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {bookmarks.map((ayat) => (
                  <AyatCard
                    key={ayat.id}
                    ayat={ayat}
                    isBookmarked={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}