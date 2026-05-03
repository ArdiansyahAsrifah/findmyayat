/**
 * lib/contentToken.ts
 *
 * Manages a server-side OAuth2 client_credentials token for Content APIs.
 * This token is fetched automatically — users never need to log in.
 *
 * Scopes used:
 *   - "content"    → for /content/api/v4/* endpoints
 *   - "post.read"  → for /quran-reflect/v1/posts/* endpoints
 *
 * Token is cached in memory and auto-refreshed before expiry.
 * Safe to call on every request — it only fetches when needed.
 */

const QF_OAUTH_BASE =
  process.env.QF_OAUTH_BASE ?? "https://prelive-oauth2.quran.foundation";

const CLIENT_ID = process.env.QF_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.QF_CLIENT_SECRET ?? "";

interface CachedToken {
  accessToken: string;
  expiresAt: number; // unix ms
}

// Module-level cache (lives for the lifetime of the server process)
let cachedContentToken: CachedToken | null = null;
let cachedReflectToken: CachedToken | null = null;

async function fetchToken(scope: string): Promise<CachedToken> {
  // client_secret_basic: credentials go in Authorization header as Base64
  const basicCredentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope,
  });

  const res = await fetch(`${QF_OAUTH_BASE}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${basicCredentials}`,
    },
    body: body.toString(),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`client_credentials token fetch failed (${scope}): ${res.status} ${err}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    // Refresh 60 seconds before actual expiry
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
}

/** Get a valid content-scope token (auto-refreshes when expired) */
export async function getContentToken(): Promise<string> {
  if (!cachedContentToken || Date.now() >= cachedContentToken.expiresAt) {
    cachedContentToken = await fetchToken("content");
  }
  return cachedContentToken.accessToken;
}

/** Get a valid token for QuranReflect Posts API. */
export async function getReflectToken(): Promise<string> {
  if (!cachedReflectToken || Date.now() >= cachedReflectToken.expiresAt) {
    try {
      cachedReflectToken = await fetchToken("post.read");
    } catch {
      cachedReflectToken = await fetchToken("content");
    }
  }
  return cachedReflectToken.accessToken;
}

/** Standard auth headers for QF API calls */
export function qfHeaders(token: string) {
  return {
    "x-auth-token": token,
    "x-client-id": CLIENT_ID,
    "Content-Type": "application/json",
  };
}

/** Base URL for QF Content/Reflect APIs */
export const QF_API_BASE =
  process.env.QF_ENV === "production"
    ? "https://apis.quran.foundation"
    : "https://apis-prelive.quran.foundation"; // ✅ Prelive base URL