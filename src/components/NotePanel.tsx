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
  compact?: boolean;
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
    <div style={{ marginTop: 12 }}>
      {/* Notes list */}
      {notes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
          {notes.map((note) => (
            <div
              key={note.id}
              style={{
                background: "var(--white)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "12px 16px",
                fontSize: 13,
              }}
            >
              {editingId === note.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    style={{
                      width: "100%",
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 13,
                      color: "var(--fg)",
                      outline: "none",
                      resize: "none",
                      fontFamily: "var(--font-body)",
                      lineHeight: 1.6,
                    }}
                    rows={3}
                    autoFocus
                  />
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--fg-muted)",
                        background: "transparent",
                        border: "1px solid var(--border)",
                        borderRadius: 999,
                        padding: "6px 14px",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleUpdate(note.id)}
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "#fff",
                        background: "var(--green)",
                        border: "none",
                        borderRadius: 999,
                        padding: "6px 14px",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              ) : deletingId === note.id ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>
                    Hapus catatan ini?
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setDeletingId(null)}
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--fg-muted)",
                        background: "transparent",
                        border: "1px solid var(--border)",
                        borderRadius: 999,
                        padding: "5px 12px",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "#fff",
                        background: "#c0392b",
                        border: "none",
                        borderRadius: 999,
                        padding: "5px 12px",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <p
                    style={{
                      flex: 1,
                      color: "var(--fg-muted)",
                      fontStyle: "italic",
                      fontFamily: "var(--font-display)",
                      fontSize: 13,
                      lineHeight: 1.7,
                    }}
                  >
                    "{note.body}"
                  </p>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => { setEditingId(note.id); setEditText(note.body); }}
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--fg-muted)",
                        background: "transparent",
                        border: "1px solid var(--border)",
                        borderRadius: 999,
                        padding: "4px 10px",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                        transition: "color 0.15s",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingId(note.id)}
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#c0392b",
                        background: "transparent",
                        border: "1px solid rgba(192,57,43,0.25)",
                        borderRadius: 999,
                        padding: "4px 10px",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
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

      {/* Add note form */}
      {showForm ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Tulis catatanmu tentang ayat ini..."
            style={{
              width: "100%",
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: 13,
              color: "var(--fg)",
              outline: "none",
              resize: "none",
              fontFamily: "var(--font-body)",
              lineHeight: 1.6,
              fontWeight: 300,
            }}
            rows={3}
            autoFocus
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              onClick={() => { setShowForm(false); setNoteText(""); }}
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--fg-muted)",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 999,
                padding: "7px 16px",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                transition: "color 0.15s",
              }}
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={!noteText.trim() || saving}
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#fff",
                background: "var(--green)",
                border: "none",
                borderRadius: 999,
                padding: "7px 16px",
                cursor: !noteText.trim() || saving ? "not-allowed" : "pointer",
                fontFamily: "var(--font-body)",
                opacity: !noteText.trim() || saving ? 0.4 : 1,
                transition: "opacity 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {saving ? (
                <>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  >
                    <path d="M5 1 A4 4 0 0 1 9 5" />
                  </svg>
                  Menyimpan…
                </>
              ) : (
                <>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M1.5 5l3 3 4-4" />
                  </svg>
                  Simpan Catatan
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Add note trigger button */
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 999,
            padding: "7px 14px",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            transition: "color 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--fg)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--fg-muted)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--fg-muted)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M5 1v8M1 5h8" />
          </svg>
          {notes.length > 0 ? "Tambah catatan" : "Tambah catatan"}
        </button>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}