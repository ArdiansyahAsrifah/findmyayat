import { NextResponse } from "next/server";
import { generateState, generatePkcePair, getAuthorizationUrl } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  const state = generateState();
  const nonce = generateState();                    // ← BARU (reuse generateState)
  const { codeVerifier, codeChallenge } = generatePkcePair();

  session.oauthState = state;
  session.codeVerifier = codeVerifier;
  session.nonce = nonce;                            // ← BARU simpan di session
  await session.save();

  const authUrl = getAuthorizationUrl(state, codeChallenge, nonce); // ← pass nonce
  return NextResponse.redirect(authUrl);
}