const QF_API_BASE =
  process.env.QF_ENV === "production"
    ? "https://apis.quran.foundation"
    : "https://apis-prelive.quran.foundation";

function userHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

export async function getQFBookmarks(accessToken: string) {
  const res = await fetch(`${QF_API_BASE}/bookmark/v1/bookmarks`, {
    headers: userHeaders(accessToken),
  });

  if (!res.ok) throw new Error("Failed get bookmarks");
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

  if (!res.ok) throw new Error("Failed add bookmark");
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

  if (!res.ok) throw new Error("Failed delete bookmark");
}