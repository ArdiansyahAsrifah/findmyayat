import { QF_API_BASE } from "@/lib/contentToken";

const CLIENT_ID = process.env.QF_CLIENT_ID ?? "";

function userHeaders(accessToken: string) {
  return {
    "x-auth-token": accessToken,
    "x-client-id": CLIENT_ID,
    "Content-Type": "application/json",
  };
}

export async function getQFBookmarks(accessToken: string) {
  const url = `${QF_API_BASE}/auth/v1/bookmarks?first=20`;
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
  const body = {
    type: "ayah",
    key: surahNumber,
    verseNumber: verseNumber,
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