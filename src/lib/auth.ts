import crypto from "crypto";

const OAUTH_BASE = process.env.QF_OAUTH_BASE!;
const CLIENT_ID = process.env.QF_CLIENT_ID!;
const CLIENT_SECRET = process.env.QF_CLIENT_SECRET!;

export function getRedirectUri() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is not set");
  return `${appUrl.replace(/\/$/, "")}/api/auth/callback`;
}

export function generateState() {
  return crypto.randomBytes(16).toString("hex");
}

function base64url(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generatePkcePair() {
  const codeVerifier = base64url(crypto.randomBytes(32));
  const hash = crypto.createHash("sha256").update(codeVerifier).digest();
  const codeChallenge = base64url(hash);
  return { codeVerifier, codeChallenge };
}

export function getAuthorizationUrl(
  state: string,
  codeChallenge: string,
  nonce: string
) {
  const url = new URL(`${OAUTH_BASE}/oauth2/auth`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("redirect_uri", getRedirectUri());
  url.searchParams.set(
    "scope",
    "openid offline_access user collection bookmark streak activity_day"
  );
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  // ✅ paksa consent ulang agar scope baru masuk ke token
  url.searchParams.set("prompt", "consent");
  return url.toString();
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
) {
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
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri(),
      code_verifier: codeVerifier,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${err}`);
  }

  return res.json();
}

export function decodeIdToken(idToken: string) {
  try {
    const payload = idToken.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64").toString());
  } catch {
    return null;
  }
}