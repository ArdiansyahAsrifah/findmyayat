import { QF_API_BASE } from "@/lib/contentToken";

const CLIENT_ID = process.env.QF_CLIENT_ID ?? "";

// Default mushaf: 1 = QCFV2 (standard Quran.com)
const DEFAULT_MUSHAF = 1;

function userHeaders(accessToken: string) {
  return {
    "x-auth-token": accessToken,
    "x-client-id": CLIENT_ID,
    "Content-Type": "application/json",
  };
}

export async function getQFBookmarks(accessToken: string) {
  // ✅ mushafId wajib sebagai query param di pre-live
  const url = `${QF_API_BASE}/auth/v1/bookmarks?first=20&mushafId=1`;
  const res = await fetch(url, {
    headers: userHeaders(accessToken),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed get bookmarks: ${res.status} ${err}`);
  }
  return res.json();
}

export async function addQFBookmark(
  accessToken: string,
  surahNumber: number,
  verseNumber: number
) {
  const url = `${QF_API_BASE}/auth/v1/bookmarks`;
  // ✅ mushaf wajib di pre-live
  const body = {
    type: "ayah",
    key: surahNumber,
    verseNumber: verseNumber,
    mushaf: DEFAULT_MUSHAF,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: userHeaders(accessToken),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed add bookmark: ${res.status} ${err}`);
  }
  return res.json();
}

export async function deleteQFBookmark(
  accessToken: string,
  bookmarkId: string
) {
  const url = `${QF_API_BASE}/auth/v1/bookmarks/${bookmarkId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: userHeaders(accessToken),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed delete bookmark: ${res.status} ${err}`);
  }
}