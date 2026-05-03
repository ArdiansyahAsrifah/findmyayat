"use client";

import { useEffect, useState } from "react";

interface TafsirData {
  text: string;
  resource_name: string;
  translated_name?: { name: string };
}

interface TafsirPanelProps {
  surahNumber: number;
  verseNumber: number;
}

export default function TafsirPanel({
  surahNumber,
  verseNumber,
}: TafsirPanelProps) {
  const [tafsir, setTafsir] = useState<TafsirData | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset saat ayat berubah
    setOpen(false);
    setTafsir(null);
    setError(false);
  }, [surahNumber, verseNumber]);

  async function fetchTafsir() {
    if (tafsir) {
      // sudah di-fetch, toggle saja
      setOpen((prev) => !prev);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const res = await fetch(
        `/api/tafsir?surah=${surahNumber}&verse=${verseNumber}`
      );
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setTafsir(data.tafsir);
      setOpen(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2 px-1">
      {/* Toggle button */}
      <button
        onClick={fetchTafsir}
        disabled={loading}
        className="text-xs text-stone-400 hover:text-emerald-600 transition-colors flex items-center gap-1 disabled:opacity-40"
      >
        <span>📖</span>
        <span>
          {loading
            ? "Memuat tafsir..."
            : open
            ? "Sembunyikan Tafsir"
            : "Lihat Tafsir Ibn Kathir"}
        </span>
      </button>

      {error && (
        <p className="text-xs text-red-400 mt-1">
          Gagal memuat tafsir. Coba lagi.
        </p>
      )}

      {/* Tafsir content */}
      {open && tafsir && (
        <div
          className="mt-3 rounded-xl px-4 py-3 text-sm"
          style={{
            background: "rgba(236, 253, 245, 0.7)",
            border: "1px solid rgba(52, 211, 153, 0.2)",
          }}
        >
          <p className="text-xs font-semibold text-emerald-700 mb-2">
            📖 {tafsir.translated_name?.name ?? tafsir.resource_name}
          </p>
          <div
            className="text-stone-700 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: tafsir.text }}
          />
        </div>
      )}
    </div>
  );
}