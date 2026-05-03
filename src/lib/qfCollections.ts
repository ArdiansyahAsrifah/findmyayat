import { QF_API_BASE } from "@/lib/contentToken";

const CLIENT_ID = process.env.QF_CLIENT_ID ?? "";

function userHeaders(accessToken: string) {
  return {
    "x-auth-token": accessToken,
    "x-client-id": CLIENT_ID,
    "Content-Type": "application/json",
  };
}

export async function getQFCollections(accessToken: string) {
  // ✅ URL benar + pagination wajib
  const res = await fetch(`${QF_API_BASE}/v1/collections?first=20`, {
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
  const res = await fetch(`${QF_API_BASE}/v1/collections`, {
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
  // ✅ URL benar + pagination
  const res = await fetch(
    `${QF_API_BASE}/v1/collections/${collectionId}/bookmarks?first=50`,
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
      // ✅ Format body yang benar
      body: JSON.stringify({
        type: "ayah",
        key: surahNumber,
        verseNumber: verseNumber,
      }),
    }
  );
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
  const res = await fetch(
    `${QF_API_BASE}/v1/collections/${collectionId}/bookmarks/${bookmarkId}`,
    {
      method: "DELETE",
      headers: userHeaders(accessToken),
    }
  );
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
  return created.data?.id ?? created.id;
}