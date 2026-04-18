// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, decodeIdToken } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3004";

  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(`${APP_URL}/?auth_error=true`);
  }

  const session = await getSession();

  if (!state || state !== session.oauthState) {
    console.error("❌ State mismatch");
    return NextResponse.redirect(`${APP_URL}/?auth_error=csrf`);
  }

  if (!code) {
    return NextResponse.redirect(`${APP_URL}/?auth_error=no_code`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    const userInfo = decodeIdToken(tokens.id_token);

    session.accessToken = tokens.access_token;
    session.refreshToken = tokens.refresh_token;
    session.idToken = tokens.id_token;

    session.user = {
      sub: userInfo?.sub ?? "",
      email: userInfo?.email,
      name: userInfo?.name ?? userInfo?.preferred_username,
      username: userInfo?.preferred_username,
    };

    delete session.oauthState;

    await session.save();

    return NextResponse.redirect(`${APP_URL}/`);
  } catch (err) {
    console.error("❌ Callback error:", err);
    return NextResponse.redirect(`${APP_URL}/?auth_error=token`);
  }
}