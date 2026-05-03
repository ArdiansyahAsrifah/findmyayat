import { QF_API_BASE } from "@/lib/contentToken";

const CLIENT_ID = process.env.QF_CLIENT_ID ?? "";

function userHeaders(accessToken: string) {
  return {
    "x-auth-token": accessToken,  // ✅ Sesuai docs
    "x-client-id": CLIENT_ID,
    "Content-Type": "application/json",
  };
}

// GET semua collections milik user
export async function getQFCollections(accessToken: string) {
  const res = await fetch(`${QF_API_BASE}/v1/collections`, {
    headers: userHeaders(accessToken),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Get collections failed: ${res.status} ${err}`);
  }
  return res.json();
}

// POST buat collection baru
export async function createQFCollection(accessToken: string, name: string) {
  const res = await fetch(`${QF_API_BASE}/v1/collections`, {
    method: "POST",
    headers: userHeaders(accessToken),
    body: JSON.stringify({ name }),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Create collection failed: ${res.status} ${err}`);
  }
  return res.json();
}

// GET items dalam collection
export async function getQFCollectionItems(
  accessToken: string,
  collectionId: string
) {
  const res = await fetch(
    `${QF_API_BASE}/v1/collections/${collectionId}/bookmarks`,
    {
      headers: userHeaders(accessToken),
      cache: "no-store",
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Get collection items failed: ${res.status} ${err}`);
  }
  return res.json();
}

// POST tambah ayat ke collection
export async function addQFCollectionItem(
  accessToken: string,
  collectionId: string,
  surahNumber: number,
  verseNumber: number
) {
  const res = await fetch(
    `${QF_API_BASE}/v1/collections/${collectionId}/bookmarks`,
    {
      method: "POST",
      headers: userHeaders(accessToken),
      body: JSON.stringify({
        key: surahNumber,
        type: "ayah",
        verseNumber: verseNumber,
        mushaf: 1,
      }),
      cache: "no-store",
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Add collection item failed: ${res.status} ${err}`);
  }
  return res.json();
}

// DELETE ayat dari collection by bookmark id
export async function deleteQFCollectionItem(
  accessToken: string,
  collectionId: string,
  bookmarkId: string
) {
  const res = await fetch(
    `${QF_API_BASE}/v1/collections/${collectionId}/bookmarks/${bookmarkId}`,
    {
      method: "DELETE",
      headers: userHeaders(accessToken),
      cache: "no-store",
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Delete collection item failed: ${res.status} ${err}`);
  }
}

// Helper: cari atau buat collection "My Kit"
export async function getOrCreateMyKitCollection(
  accessToken: string
): Promise<string> {
  const data = await getQFCollections(accessToken);
  const collections = data.data ?? data.collections ?? [];
  const existing = collections.find(
    (c: { name: string }) => c.name === "My Kit"
  );
  if (existing) return existing.id;
  const created = await createQFCollection(accessToken, "My Kit");
  return created.data?.id ?? created.id;
}