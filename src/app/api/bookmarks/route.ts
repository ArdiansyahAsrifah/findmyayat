import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/tokenRefresh";
import { getQFBookmarks, addQFBookmark, deleteQFBookmark } from "@/lib/qfBookmarks";

export async function GET() {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken)
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const data = await getQFBookmarks(accessToken);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/bookmarks]", err);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
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

    const data = await addQFBookmark(accessToken, surahNumber, verseNumber);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[POST /api/bookmarks]", err);
    return NextResponse.json(
      { error: "Failed to add bookmark" },
      { status: 500 }
    );
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

    await deleteQFBookmark(accessToken, bookmarkId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/bookmarks]", err);
    return NextResponse.json(
      { error: "Failed to delete bookmark" },
      { status: 500 }
    );
  }
}