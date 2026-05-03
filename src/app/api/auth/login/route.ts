import { NextResponse } from "next/server";
import { generateState, generatePkcePair, getAuthorizationUrl } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function GET() {
  console.log("OAUTH_BASE:", process.env.QF_OAUTH_BASE);
  console.log("CLIENT_ID:", process.env.QF_CLIENT_ID);

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