import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/tokenRefresh";
import {
  getQFCollectionItems,
  addQFCollectionItem,
  deleteQFCollectionItem,
} from "@/lib/qfCollections";

export async function GET() {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken)
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const data = await getQFCollectionItems(accessToken);
    // ✅ response shape: { data: { collection, bookmarks: [...] } }
    const bookmarks = data.data?.bookmarks ?? [];
    return NextResponse.json({ items: bookmarks });
  } catch (err) {
    console.error("[GET /api/collections]", err);
    return NextResponse.json({ error: "Failed to fetch kit" }, { status: 500 });
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

    const data = await addQFCollectionItem(accessToken, surahNumber, verseNumber);
    return NextResponse.json({ item: data });
  } catch (err) {
    console.error("[POST /api/collections]", err);
    return NextResponse.json({ error: "Failed to add to kit" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken)
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const { bookmarkId } = await req.json();
    if (!bookmarkId)
      return NextResponse.json(
        { error: "bookmarkId is required" },
        { status: 400 }
      );

    await deleteQFCollectionItem(accessToken, bookmarkId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/collections]", err);
    return NextResponse.json(
      { error: "Failed to remove from kit" },
      { status: 500 }
    );
  }
}