import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/tokenRefresh";
import {
  getOrCreateMyKitCollection,
  getQFCollectionItems,
  addQFCollectionItem,
  deleteQFCollectionItem,
} from "@/lib/qfCollections";

export async function GET() {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken)
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const collectionId = await getOrCreateMyKitCollection(accessToken);
    const data = await getQFCollectionItems(accessToken, collectionId);
    return NextResponse.json({ collectionId, items: data });
  } catch (err) {
    console.error("[GET /api/collections]", err);
    return NextResponse.json(
      { error: "Failed to fetch kit" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken)
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const { surahNumber, verseNumber } = await req.json();
    if (!surahNumber || !verseNumber) {
      return NextResponse.json(
        { error: "surahNumber and verseNumber are required" },
        { status: 400 }
      );
    }

    const collectionId = await getOrCreateMyKitCollection(accessToken);
    const data = await addQFCollectionItem(
      accessToken,
      collectionId,
      surahNumber,
      verseNumber
    );
    return NextResponse.json({ collectionId, item: data });
  } catch (err) {
    console.error("[POST /api/collections]", err);
    return NextResponse.json(
      { error: "Failed to add to kit" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken)
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const { verseKey } = await req.json();
    if (!verseKey)
      return NextResponse.json(
        { error: "verseKey is required" },
        { status: 400 }
      );

    const collectionId = await getOrCreateMyKitCollection(accessToken);
    await deleteQFCollectionItem(accessToken, collectionId, verseKey);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/collections]", err);
    return NextResponse.json(
      { error: "Failed to remove from kit" },
      { status: 500 }
    );
  }
}