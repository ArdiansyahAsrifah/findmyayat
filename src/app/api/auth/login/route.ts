import { NextResponse } from "next/server";
import { generateState, generatePkcePair } from "@/lib/auth";
import { getAuthorizationUrl } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  const state = generateState();
  const nonce = generateState();
  const { codeVerifier, codeChallenge } = generatePkcePair();

  session.oauthState = state;
  session.codeVerifier = codeVerifier;
  session.nonce = nonce;
  await session.save();

  const authUrl = getAuthorizationUrl(state, codeChallenge, nonce);
  console.log("[login] Redirecting to:", authUrl);

  return NextResponse.redirect(authUrl);
}