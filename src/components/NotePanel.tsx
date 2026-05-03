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
      if (data.note) {
        setNotes((prev) => [normalizeNotes([data.note])[0], ...prev]);
      }
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
          n.id === noteId
            ? { ...n, body: data.note?.body ?? editText.trim() }
            : n
        )
      );
      setEditingId(null);
    } catch {
      // silent
    }
  }

  if (loading) return null;

  return (
    <div className="mt-2 px-1">
      {/* Notes list */}
      {notes.length > 0 && (
        <div className="flex flex-col gap-2 mb-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl px-4 py-3 text-sm"
              style={{
                background: "rgba(254, 243, 199, 0.6)",
                border: "1px solid rgba(180, 140, 60, 0.2)",
              }}
            >
              {editingId === note.id ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full text-sm bg-white rounded-lg px-3 py-2 border border-amber-200 outline-none resize-none text-stone-700"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-stone-400 hover:text-stone-600"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleUpdate(note.id)}
                      className="text-xs font-semibold text-amber-700 hover:text-amber-900"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <p className="text-stone-700 leading-relaxed flex-1">
                    📝 {note.body}
                  </p>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingId(note.id);
                        setEditText(note.body);
                      }}
                      className="text-xs text-stone-300 hover:text-amber-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-xs text-stone-300 hover:text-red-400"
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

      {/* Add note form */}
      {showForm ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Tulis catatanmu tentang ayat ini..."
            className="w-full text-sm bg-white rounded-xl px-4 py-3 border border-amber-200 outline-none resize-none text-stone-700 placeholder:text-stone-300"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowForm(false); setNoteText(""); }}
              className="text-xs text-stone-400 hover:text-stone-600"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={!noteText.trim() || saving}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #92400e, #b45309)",
                color: "#fef3c7",
              }}
            >
              {saving ? "Menyimpan..." : "Simpan Catatan"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="text-xs text-stone-400 hover:text-amber-600 transition-colors flex items-center gap-1"
        >
          <span>📝</span>
          <span>{notes.length > 0 ? "Tambah catatan lagi" : "Tambah catatan"}</span>
        </button>
      )}
    </div>
  );
}