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

export async function getQFCollections(accessToken: string) {
  // ✅ pagination wajib
  const url = `${QF_API_BASE}/auth/v1/collections?first=20`;
  const res = await fetch(url, {
    headers: userHeaders(accessToken),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Get collections failed: ${res.status} ${err}`);
  }
  return res.json();
}

export async function createQFCollection(accessToken: string, name: string) {
  const url = `${QF_API_BASE}/auth/v1/collections`;
  const res = await fetch(url, {
    method: "POST",
    headers: userHeaders(accessToken),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Create collection failed: ${res.status} ${err}`);
  }
  return res.json();
}

export async function getQFCollectionItems(
  accessToken: string,
  collectionId: string
) {
  // ✅ endpoint yang benar: /bookmarks bukan /verses
  const url = `${QF_API_BASE}/auth/v1/collections/${collectionId}/bookmarks?first=50`;
  const res = await fetch(url, {
    headers: userHeaders(accessToken),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Get collection items failed: ${res.status} ${err}`);
  }
  return res.json();
}

export async function addQFCollectionItem(
  accessToken: string,
  collectionId: string,
  surahNumber: number,
  verseNumber: number
) {
  // ✅ endpoint yang benar: /bookmarks bukan /verses
  const url = `${QF_API_BASE}/auth/v1/collections/${collectionId}/bookmarks`;
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
    throw new Error(`Add collection item failed: ${res.status} ${err}`);
  }
  return res.json();
}

export async function deleteQFCollectionItem(
  accessToken: string,
  collectionId: string,
  bookmarkId: string
) {
  const url = `${QF_API_BASE}/auth/v1/collections/${collectionId}/bookmarks/${bookmarkId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: userHeaders(accessToken),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Delete collection item failed: ${res.status} ${err}`);
  }
}

export async function getOrCreateMyKitCollection(
  accessToken: string
): Promise<string> {
  const data = await getQFCollections(accessToken);
  const collections: Array<{ id: string; name: string }> = data.data ?? [];
  const existing = collections.find((c) => c.name === "My Kit");
  if (existing) return existing.id;

  const created = await createQFCollection(accessToken, "My Kit");
  // ✅ pre-live response: { success, data: { id, name, updatedAt } }
  return created.data?.id ?? created.id;
}