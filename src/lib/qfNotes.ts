// src/lib/qfNotes.ts

import { QF_API_BASE } from "@/lib/contentToken";

const CLIENT_ID = process.env.QF_CLIENT_ID ?? "";

function userHeaders(accessToken: string) {
  return {
    "x-auth-token": accessToken,
    "x-client-id": CLIENT_ID,
    "Content-Type": "application/json",
  };
}

// Ambil semua notes user untuk ayat tertentu
export async function getQFNotes(
  accessToken: string,
  surahNumber: number,
  verseNumber: number
) {
  const url = `${QF_API_BASE}/auth/v1/notes?verseKey=${surahNumber}:${verseNumber}&first=10`;
  const res = await fetch(url, {
    headers: userHeaders(accessToken),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Get notes failed: ${res.status} ${err}`);
  }
  return res.json();
}

// Buat note baru untuk ayat tertentu
export async function createQFNote(
  accessToken: string,
  surahNumber: number,
  verseNumber: number,
  body: string
) {
  const url = `${QF_API_BASE}/auth/v1/notes`;
  const res = await fetch(url, {
    method: "POST",
    headers: userHeaders(accessToken),
    body: JSON.stringify({
      verseKey: `${surahNumber}:${verseNumber}`,
      body,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Create note failed: ${res.status} ${err}`);
  }
  return res.json();
}

// Hapus note
export async function deleteQFNote(accessToken: string, noteId: string) {
  const url = `${QF_API_BASE}/auth/v1/notes/${noteId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: userHeaders(accessToken),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Delete note failed: ${res.status} ${err}`);
  }
}

// Update note
export async function updateQFNote(
  accessToken: string,
  noteId: string,
  body: string
) {
  const url = `${QF_API_BASE}/auth/v1/notes/${noteId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: userHeaders(accessToken),
    body: JSON.stringify({ body }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Update note failed: ${res.status} ${err}`);
  }
  return res.json();
}