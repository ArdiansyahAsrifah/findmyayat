// app/api/bookmarks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  getQFBookmarks,
  addQFBookmark,
  deleteQFBookmark,
} from "@/lib/qfBookmarks";

// GET — ambil semua bookmarks user dari QF
export async function GET() {
  try {
    const session = await getSession();
    if (!session.accessToken) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const data = await getQFBookmarks(session.accessToken);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/bookmarks]", err);
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}

// POST — tambah bookmark
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

    const data = await addQFBookmark(session.accessToken, surahNumber, verseNumber);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[POST /api/bookmarks]", err);
    return NextResponse.json({ error: "Failed to add bookmark" }, { status: 500 });
  }
}

// DELETE — hapus bookmark
// Body: { bookmarkId: number }
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.accessToken) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const body = await req.json();
    const { bookmarkId } = body;

    if (!bookmarkId) {
      return NextResponse.json(
        { error: "bookmarkId is required" },
        { status: 400 }
      );
    }

    await deleteQFBookmark(session.accessToken, bookmarkId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/bookmarks]", err);
    return NextResponse.json({ error: "Failed to delete bookmark" }, { status: 500 });
  }
}