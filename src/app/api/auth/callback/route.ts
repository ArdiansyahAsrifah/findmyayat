import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, decodeIdToken } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const APP_URL = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");

  if (error) {
    console.error("[callback] OAuth error:", error);
    return NextResponse.redirect(`${APP_URL}/?auth_error=true`);
  }

  const session = await getSession();

  if (!state || state !== session.oauthState) {
    console.error("[callback] State mismatch");
    return NextResponse.redirect(`${APP_URL}/?auth_error=csrf`);
  }

  if (!code) {
    return NextResponse.redirect(`${APP_URL}/?auth_error=no_code`);
  }

  try {
    const codeVerifier = session.codeVerifier;
    if (!codeVerifier) {
      return NextResponse.redirect(`${APP_URL}/?auth_error=no_verifier`);
    }

    const tokens = await exchangeCodeForTokens(code, codeVerifier);
    const userInfo = decodeIdToken(tokens.id_token);

    if (!userInfo?.nonce || userInfo.nonce !== session.nonce) {
      console.error("[callback] Nonce mismatch");
      return NextResponse.redirect(`${APP_URL}/?auth_error=nonce`);
    }

    session.accessToken = tokens.access_token;
    session.refreshToken = tokens.refresh_token;
    session.idTokenHint = userInfo.sub;
    session.tokenExpiresAt = Date.now() + (tokens.expires_in ?? 3600) * 1000;
    session.user = {
      sub: userInfo?.sub ?? "",
      email: userInfo?.email,
      name: userInfo?.name ?? userInfo?.preferred_username,
      username: userInfo?.preferred_username,
    };

    delete session.oauthState;
    delete session.codeVerifier;
    delete session.nonce;

    await session.save();

    return NextResponse.redirect(`${APP_URL}/`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[callback] Error:", message);
    return NextResponse.redirect(
      `${APP_URL}/?auth_error=token&detail=${encodeURIComponent(message)}`
    );
  }
}