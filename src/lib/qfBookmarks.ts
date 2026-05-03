import { QF_API_BASE } from "@/lib/contentToken";

const CLIENT_ID = process.env.QF_CLIENT_ID ?? "";

function userHeaders(accessToken: string) {
  return {
    "Authorization": `Bearer ${accessToken}`, // ✅ Standard Bearer token
    "x-client-id": CLIENT_ID,
    "Content-Type": "application/json",
  };
}

export async function getQFBookmarks(accessToken: string) {
  const res = await fetch(`${QF_API_BASE}/bookmark/v1/bookmarks`, {
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
  const res = await fetch(`${QF_API_BASE}/bookmark/v1/bookmarks`, {
    method: "POST",
    headers: userHeaders(accessToken),
    body: JSON.stringify({
      verse_key: `${surahNumber}:${verseNumber}`,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed add bookmark: ${res.status} ${err}`);
  }
  return res.json();
}

export async function deleteQFBookmark(
  accessToken: string,
  bookmarkId: number
) {
  const res = await fetch(
    `${QF_API_BASE}/bookmark/v1/bookmarks/${bookmarkId}`,
    {
      method: "DELETE",
      headers: userHeaders(accessToken),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed delete bookmark: ${res.status} ${err}`);
  }
}