import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const QF_OAUTH_BASE = process.env.QF_OAUTH_BASE ?? "https://prelive-oauth2.quran.foundation";

  const idToken = session.idToken;
  session.destroy();

  const params = new URLSearchParams({
    post_logout_redirect_uri: `${APP_URL}/`,
    ...(idToken ? { id_token_hint: idToken } : {}),
  });

  return NextResponse.redirect(`${QF_OAUTH_BASE}/oauth2/sessions/logout?${params}`);
}