// app/api/collections/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  getOrCreateMyKitCollection,
  getQFCollectionItems,
  addQFCollectionItem,
  deleteQFCollectionItem,
} from "@/lib/qfCollections";

// GET — ambil semua ayat di "My Kit" collection
export async function GET() {
  try {
    const session = await getSession();
    if (!session.accessToken) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const collectionId = await getOrCreateMyKitCollection(session.accessToken);
    const data = await getQFCollectionItems(session.accessToken, collectionId);

    return NextResponse.json({ collectionId, items: data });
  } catch (err) {
    console.error("[GET /api/collections]", err);
    return NextResponse.json({ error: "Failed to fetch kit" }, { status: 500 });
  }
}

// POST — tambah ayat ke "My Kit"
// Body: { surahNumber: number, verseNumber: number }
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.accessToken) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const body = await req.json();
    const { surahNumber, verseNumber } = body;

    if (!surahNumber || !verseNumber) {
      return NextResponse.json(
        { error: "surahNumber and verseNumber are required" },
        { status: 400 }
      );
    }

    const collectionId = await getOrCreateMyKitCollection(session.accessToken);
    const data = await addQFCollectionItem(
      session.accessToken,
      collectionId,
      surahNumber,
      verseNumber
    );

    return NextResponse.json({ collectionId, item: data });
  } catch (err) {
    console.error("[POST /api/collections]", err);
    return NextResponse.json({ error: "Failed to add to kit" }, { status: 500 });
  }
}

// DELETE — hapus ayat dari "My Kit"
// Body: { verseKey: string }  contoh: "2:255"
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.accessToken) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const body = await req.json();
    const { verseKey } = body;

    if (!verseKey) {
      return NextResponse.json(
        { error: "verseKey is required" },
        { status: 400 }
      );
    }

    const collectionId = await getOrCreateMyKitCollection(session.accessToken);
    await deleteQFCollectionItem(session.accessToken, collectionId, verseKey);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/collections]", err);
    return NextResponse.json({ error: "Failed to remove from kit" }, { status: 500 });
  }
}