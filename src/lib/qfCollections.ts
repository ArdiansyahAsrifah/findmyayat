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
  const res = await fetch(`${QF_API_BASE}/auth/v1/collections`, { // ✅ /auth/v1/
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
  const res = await fetch(`${QF_API_BASE}/auth/v1/collections`, { // ✅ /auth/v1/
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

export async function getQFCollectionItems(accessToken: string, collectionId: number) {
  const res = await fetch(
    `${QF_API_BASE}/auth/v1/collections/${collectionId}/verses`, // ✅ /auth/v1/
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
  collectionId: number,
  surahNumber: number,
  verseNumber: number
) {
  const res = await fetch(
    `${QF_API_BASE}/auth/v1/collections/${collectionId}/verses`, // ✅ /auth/v1/
    {
      method: "POST",
      headers: userHeaders(accessToken),
      body: JSON.stringify({
        verse_key: `${surahNumber}:${verseNumber}`,
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

export async function deleteQFCollectionItem(
  accessToken: string,
  collectionId: number,
  verseKey: string
) {
  const res = await fetch(
    `${QF_API_BASE}/auth/v1/collections/${collectionId}/verses/${verseKey}`, // ✅ /auth/v1/
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

export async function getOrCreateMyKitCollection(accessToken: string): Promise<number> {
  const data = await getQFCollections(accessToken);
  const collections = data.collections ?? data.data ?? [];
  const existing = collections.find((c: { name: string }) => c.name === "My Kit");
  if (existing) return existing.id;
  const created = await createQFCollection(accessToken, "My Kit");
  return created.id ?? created.collection?.id;
}