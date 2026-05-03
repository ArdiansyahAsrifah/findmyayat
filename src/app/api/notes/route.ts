import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/tokenRefresh";
import {
  getQFNotes,
  createQFNote,
  deleteQFNote,
  updateQFNote,
} from "@/lib/qfNotes";

// GET — ambil notes untuk ayat tertentu
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const surah = searchParams.get("surah");
  const verse = searchParams.get("verse");

  if (!surah || !verse)
    return NextResponse.json({ error: "Missing surah or verse" }, { status: 400 });

  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken)
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const data = await getQFNotes(accessToken, Number(surah), Number(verse));
    const notes = data.data ?? [];
    return NextResponse.json({ notes });
  } catch (err) {
    console.error("[GET /api/notes]", err);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

// POST — buat note baru
export async function POST(req: NextRequest) {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken)
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const { surahNumber, verseNumber, body } = await req.json();
    if (!surahNumber || !verseNumber || !body)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const data = await createQFNote(accessToken, surahNumber, verseNumber, body);
    return NextResponse.json({ note: data.data ?? data });
  } catch (err) {
    console.error("[POST /api/notes]", err);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}

// PATCH — update note
export async function PATCH(req: NextRequest) {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken)
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const { noteId, body } = await req.json();
    if (!noteId || !body)
      return NextResponse.json({ error: "Missing noteId or body" }, { status: 400 });

    const data = await updateQFNote(accessToken, noteId, body);
    return NextResponse.json({ note: data.data ?? data });
  } catch (err) {
    console.error("[PATCH /api/notes]", err);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

// DELETE — hapus note
export async function DELETE(req: NextRequest) {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken)
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const { noteId } = await req.json();
    if (!noteId)
      return NextResponse.json({ error: "Missing noteId" }, { status: 400 });

    await deleteQFNote(accessToken, noteId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/notes]", err);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}