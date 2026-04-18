// app/api/auth/me/route.ts
// Client-side bisa fetch ini untuk tahu siapa yang login
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  
  if (!session.accessToken || !session.user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: session.user });
}