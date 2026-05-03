import { QF_API_BASE } from "@/lib/contentToken";

const CLIENT_ID = process.env.QF_CLIENT_ID ?? "";

function userHeaders(accessToken: string) {
  return {
    "x-auth-token": accessToken,
    "x-client-id": CLIENT_ID,
    "Content-Type": "application/json",
  };
}

// GET notes per ayat — pakai endpoint /notes/verse?verseKey=2:255
export async function getQFNotes(
  accessToken: string,
  surahNumber: number,
  verseNumber: number
) {
  const verseKey = `${surahNumber}:${verseNumber}`;
  const url = `${QF_API_BASE}/auth/v1/notes/verse?verseKey=${verseKey}`;
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

// POST — body pakai ranges, bukan verseKey
export async function createQFNote(
  accessToken: string,
  surahNumber: number,
  verseNumber: number,
  body: string
) {
  const verseKey = `${surahNumber}:${verseNumber}`;
  const url = `${QF_API_BASE}/auth/v1/notes`;
  const res = await fetch(url, {
    method: "POST",
    headers: userHeaders(accessToken),
    body: JSON.stringify({
      body,
      saveToQR: false,
      ranges: [`${verseKey}-${verseKey}`],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Create note failed: ${res.status} ${err}`);
  }
  return res.json();
}

// DELETE note by ID
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

// PATCH note by ID
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