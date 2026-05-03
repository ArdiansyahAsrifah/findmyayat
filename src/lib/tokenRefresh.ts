import { getSession } from "@/lib/session";

const OAUTH_BASE = process.env.QF_OAUTH_BASE!;
const CLIENT_ID = process.env.QF_CLIENT_ID!;
const CLIENT_SECRET = process.env.QF_CLIENT_SECRET!;

export async function getValidAccessToken(): Promise<string | null> {
  const session = await getSession();

  if (!session.accessToken) return null;

  const now = Date.now();
  const expiresAt = session.tokenExpiresAt ?? 0;

  // Token masih valid (buffer 5 menit)
  if (now < expiresAt - 5 * 60 * 1000) {
    return session.accessToken;
  }

  // Token expired → coba refresh
  if (!session.refreshToken) {
    console.warn("[tokenRefresh] No refresh token available");
    return null;
  }

  try {
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
      "base64"
    );

    const res = await fetch(`${OAUTH_BASE}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: session.refreshToken,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[tokenRefresh] Failed:", res.status, err);
      return null;
    }

    const tokens = await res.json();

    session.accessToken = tokens.access_token;
    if (tokens.refresh_token) {
      session.refreshToken = tokens.refresh_token;
    }
    session.tokenExpiresAt = Date.now() + (tokens.expires_in ?? 3600) * 1000;
    await session.save();

    console.log("[tokenRefresh] Token refreshed successfully");
    return session.accessToken!;
  } catch (err) {
    console.error("[tokenRefresh] Error:", err);
    return null;
  }
}