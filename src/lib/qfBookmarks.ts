import { QF_API_BASE } from "@/lib/contentToken";

const CLIENT_ID = process.env.QF_CLIENT_ID ?? "";

function userHeaders(accessToken: string) {
  return {
    "x-auth-token": accessToken,   // ✅ Sesuai docs
    "x-client-id": CLIENT_ID,
    "Content-Type": "application/json",
  };
}

// GET semua bookmarks user
export async function getQFBookmarks(accessToken: string) {
  const res = await fetch(`${QF_API_BASE}/v1/bookmarks`, {
    headers: userHeaders(accessToken),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed get bookmarks: ${res.status} ${err}`);
  }
  return res.json();
}

// POST tambah bookmark ayah — pakai /v1/collections/__default__/bookmarks
export async function addQFBookmark(
  accessToken: string,
  surahNumber: number,
  verseNumber: number
) {
  const res = await fetch(
    `${QF_API_BASE}/v1/collections/__default__/bookmarks`,
    {
      method: "POST",
      headers: userHeaders(accessToken),
      body: JSON.stringify({
        key: surahNumber,        // Surah number
        type: "ayah",
        verseNumber: verseNumber,
        mushaf: 1,               // QCFV2 (default Quran.com)
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed add bookmark: ${res.status} ${err}`);
  }
  return res.json();
}

// DELETE bookmark by id
export async function deleteQFBookmark(
  accessToken: string,
  bookmarkId: string
) {
  const res = await fetch(`${QF_API_BASE}/v1/bookmarks/${bookmarkId}`, {
    method: "DELETE",
    headers: userHeaders(accessToken),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed delete bookmark: ${res.status} ${err}`);
  }
}