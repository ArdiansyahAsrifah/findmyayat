import { NextResponse } from "next/server";
import { generateState, getAuthorizationUrl } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  // 🔥 FIX: kalau sudah ada state, pakai itu (jangan generate baru)
  if (session.oauthState) {
    const authUrl = getAuthorizationUrl(session.oauthState);
    console.log("REUSE STATE:", session.oauthState);
    return NextResponse.redirect(authUrl);
  }

  const state = generateState();
  session.oauthState = state;
  await session.save();

  const authUrl = getAuthorizationUrl(state);

  console.log("STATE (saved):", state);
  console.log("AUTH URL:", authUrl);

  return NextResponse.redirect(authUrl);
}