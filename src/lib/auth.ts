// lib/auth.ts
import crypto from "crypto";

const OAUTH_BASE = process.env.QF_OAUTH_BASE!;
const CLIENT_ID = process.env.QF_CLIENT_ID!;
const CLIENT_SECRET = process.env.QF_CLIENT_SECRET!;

export const REDIRECT_URI =
  process.env.NEXT_PUBLIC_APP_URL + "/api/auth/callback";

// ✅ Generate state (simple & aman)
export function generateState() {
  return crypto.randomBytes(32).toString("hex");
}

// ✅ FIX UTAMA ADA DISINI (authorize/)
export function getAuthorizationUrl(state: string) {
  const url = new URL(`${OAUTH_BASE}/authorize`); // ❗ TANPA trailing slash

  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", process.env.QF_CLIENT_ID!);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("scope", "openid offline_access bookmark collection user");
  url.searchParams.set("state", state);

  return url.toString();
}

// ✅ Tukar code → token
export async function exchangeCodeForTokens(code: string) {
  const res = await fetch(`${OAUTH_BASE}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${err}`);
  }

  return res.json();
}

// ✅ decode id token
export function decodeIdToken(idToken: string) {
  try {
    const payload = idToken.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64").toString());
  } catch {
    return null;
  }
}