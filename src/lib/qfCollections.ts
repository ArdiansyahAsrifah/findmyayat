import { QF_API_BASE } from "@/lib/contentToken";

const CLIENT_ID = process.env.QF_CLIENT_ID ?? "";
const DEFAULT_MUSHAF = 1;

function userHeaders(accessToken: string) {
  return {
    "x-auth-token": accessToken,
    "x-client-id": CLIENT_ID,
    "Content-Type": "application/json",
  };
}

// ✅ Pakai __default__ — tidak perlu buat collection, tidak butuh scope create
export async function getQFCollectionItems(accessToken: string) {
  const url = `${QF_API_BASE}/auth/v1/collections/__default__?first=20`;
  console.log("[getQFCollectionItems] fetching:", url);
  const res = await fetch(url, {
    headers: userHeaders(accessToken),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Get collection items failed: ${res.status} ${err}`);
  }
  return res.json();
  // response: { success, data: { collection, bookmarks: [...] }, pagination }
}

export async function addQFCollectionItem(
  accessToken: string,
  surahNumber: number,
  verseNumber: number
) {
  // ✅ POST ke __default__ collection
  const url = `${QF_API_BASE}/auth/v1/collections/__default__/bookmarks`;
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
    throw new Error(`Add collection item failed: ${res.status} ${err}`);
  }
  return res.json();
}

export async function deleteQFCollectionItem(
  accessToken: string,
  bookmarkId: string
) {
  const url = `${QF_API_BASE}/auth/v1/collections/__default__/bookmarks/${bookmarkId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: userHeaders(accessToken),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Delete collection item failed: ${res.status} ${err}`);
  }
}