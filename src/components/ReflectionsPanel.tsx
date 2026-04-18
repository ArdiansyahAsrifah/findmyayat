"use client";

import { useState, useEffect } from "react";

interface Reflection {
  id: number;
  body: string;
  user?: { name?: string; username?: string };
  likes_count?: number;
  created_at?: string;
}

interface Props {
  surahNumber: number;
  verseNumber: number;
}

type Status = "loading" | "success" | "scope_not_enabled" | "error" | "empty";

export default function ReflectionsPanel({ surahNumber, verseNumber }: Props) {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const res = await fetch(
          `/api/reflections?surah=${surahNumber}&verse=${verseNumber}&limit=3`
        );
        const data = await res.json();

        if (cancelled) return;

        // Handle known scope error from QuranReflect
        if (data.error === "scope_not_enabled" || res.status === 403) {
          setStatus("scope_not_enabled");
          return;
        }

        if (!res.ok) {
          setStatus("error");
          return;
        }

        const raw: any[] = data.data ?? data.reflections ?? [];
        const items: Reflection[] = raw.map((p) => ({
          id: p.id,
          body: p.body ?? p.text ?? "",
          user: p.author
            ? {
                name: p.author.firstName
                  ? `${p.author.firstName} ${p.author.lastName ?? ""}`.trim()
                  : p.author.username,
                username: p.author.username,
              }
            : undefined,
          likes_count: p.likesCount ?? p.likes_count ?? 0,
          created_at: p.createdAt ?? p.created_at ?? "",
        }));
        if (items.length === 0) {
          setStatus("empty");
        } else {
          setReflections(items);
          setStatus("success");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [surahNumber, verseNumber]);

  // ── Loading skeleton ────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-3 rounded-full bg-violet-100 mb-2 w-3/4" />
            <div className="h-3 rounded-full bg-violet-100 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // ── Scope not enabled ───────────────────────────────────
  if (status === "scope_not_enabled") {
    return (
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3"
        style={{
          background: "rgba(100, 70, 180, 0.06)",
          border: "1px dashed rgba(100, 70, 180, 0.2)",
        }}
      >
        <span className="text-lg mt-0.5">🔒</span>
        <div>
          <p
            className="text-xs font-semibold mb-0.5"
            style={{ color: "#6040b0" }}
          >
            Reflections not available
          </p>
          <p className="text-xs" style={{ color: "#9070c0" }}>
            Community reflections require additional API access. Enable the
            reflections scope in your QuranReflect app settings.
          </p>
        </div>
      </div>
    );
  }

  // ── Generic error ───────────────────────────────────────
  if (status === "error") {
    return (
      <p className="text-xs text-stone-400 italic">
        Could not load reflections right now.
      </p>
    );
  }

  // ── Empty ───────────────────────────────────────────────
  if (status === "empty") {
    return (
      <div className="text-center py-3">
        <p className="text-2xl mb-1">🌱</p>
        <p className="text-xs text-stone-400">
          No reflections yet. Be the first!
        </p>
      </div>
    );
  }

  // ── Success ─────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <p
        className="text-[11px] font-semibold uppercase tracking-widest mb-3"
        style={{ color: "#7060a0" }}
      >
        Community reflections
      </p>

      {reflections.map((r) => (
        <div
          key={r.id}
          className="rounded-xl px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(100,70,180,0.1)",
          }}
        >
          <p className="text-xs leading-relaxed text-stone-600 mb-2">
            {r.body}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-stone-400">
              {r.user?.name ?? r.user?.username ?? "Anonymous"}
            </span>
            {r.likes_count !== undefined && r.likes_count > 0 && (
              <span
                className="text-[10px] flex items-center gap-1"
                style={{ color: "#9070c0" }}
              >
                ♥ {r.likes_count}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}