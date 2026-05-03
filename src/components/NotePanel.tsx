// src/components/NotePanel.tsx
"use client";

import { useEffect, useState } from "react";

interface Note {
  id: string;
  body: string;
  createdAt?: string;
}

interface NotePanelProps {
  surahNumber: number;
  verseNumber: number;
}

export default function NotePanel({ surahNumber, verseNumber }: NotePanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [surahNumber, verseNumber]);

  async function fetchNotes() {
    try {
      const res = await fetch(`/api/notes?surah=${surahNumber}&verse=${verseNumber}`);
      if (!res.ok) return;
      const data = await res.json();
      setNotes(normalizeNotes(data.notes ?? []));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  function normalizeNotes(raw: any[]): Note[] {
    return raw.map((n) => ({
      id: n.id,
      body: n.body ?? n.text ?? "",
      createdAt: n.createdAt ?? n.created_at ?? "",
    }));
  }

  async function handleSave() {
    if (!noteText.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surahNumber, verseNumber, body: noteText.trim() }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.note) setNotes((prev) => [normalizeNotes([data.note])[0], ...prev]);
      setNoteText("");
      setShowForm(false);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId: string) {
    try {
      await fetch("/api/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  }

  async function handleUpdate(noteId: string) {
    if (!editText.trim()) return;
    try {
      const res = await fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, body: editText.trim() }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, body: data.note?.body ?? editText.trim() } : n
        )
      );
      setEditingId(null);
    } catch {
      // silent
    }
  }

  if (loading) return null;

  return (
    <div className="mt-3">
      {/* Notes list */}
      {notes.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl px-4 py-3 text-sm"
              style={{
                background: "#FDFAF5",
                border: "0.5px solid #E8E2D6",
              }}
            >
              {editingId === note.id ? (
                /* Edit mode */
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none"
                    style={{
                      background: "#FFFFFF",
                      border: "0.5px solid #E8E2D6",
                      color: "#1A1A1A",
                    }}
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
                      style={{
                        border: "0.5px solid #E8E2D6",
                        color: "#6B6B5E",
                        background: "transparent",
                      }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleUpdate(note.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                      style={{ background: "#1C4F3A", color: "#FFFFFF" }}
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              ) : deletingId === note.id ? (
                /* Confirm delete */
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs" style={{ color: "#6B6B5E" }}>
                    Hapus catatan ini?
                  </p>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setDeletingId(null)}
                      className="text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
                      style={{
                        border: "0.5px solid #E8E2D6",
                        color: "#6B6B5E",
                        background: "transparent",
                      }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                      style={{ background: "#c0392b", color: "#FFFFFF" }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex items-start justify-between gap-3">
                  <p className="leading-relaxed flex-1" style={{ color: "#1A1A1A" }}>
                    {note.body}
                  </p>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => { setEditingId(note.id); setEditText(note.body); }}
                      className="text-xs px-2.5 py-1 rounded-lg transition-opacity hover:opacity-70"
                      style={{
                        border: "0.5px solid #E8E2D6",
                        color: "#6B6B5E",
                        background: "transparent",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingId(note.id)}
                      className="text-xs px-2.5 py-1 rounded-lg transition-opacity hover:opacity-70"
                      style={{
                        border: "0.5px solid rgba(192,57,43,0.3)",
                        color: "#c0392b",
                        background: "rgba(192,57,43,0.05)",
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add note */}
      {showForm ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Tulis catatanmu tentang ayat ini..."
            className="w-full text-sm rounded-xl px-4 py-3 outline-none resize-none"
            style={{
              background: "#FFFFFF",
              border: "0.5px solid #E8E2D6",
              color: "#1A1A1A",
            }}
            rows={3}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowForm(false); setNoteText(""); }}
              className="text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
              style={{
                border: "0.5px solid #E8E2D6",
                color: "#6B6B5E",
                background: "transparent",
              }}
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={!noteText.trim() || saving}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-40 transition-opacity hover:opacity-80"
              style={{ background: "#1C4F3A", color: "#FFFFFF" }}
            >
              {saving ? "Menyimpan..." : "Simpan Catatan"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
          style={{
            border: "0.5px solid #E8E2D6",
            color: "#6B6B5E",
            background: "transparent",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5.5 1v9M1 5.5h9" />
          </svg>
          {notes.length > 0 ? "Tambah catatan" : "Tambah catatan"}
        </button>
      )}
    </div>
  );
}