const QF_OAUTH_BASE =
  process.env.QF_OAUTH_BASE ?? "https://prelive-oauth2.quran.foundation";
const CLIENT_ID = process.env.QF_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.QF_CLIENT_SECRET ?? "";

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

let cachedContentToken: CachedToken | null = null;
let cachedReflectToken: CachedToken | null = null;

async function fetchToken(scope: string): Promise<CachedToken> {
  const basicCredentials = Buffer.from(
    `${CLIENT_ID}:${CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${QF_OAUTH_BASE}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicCredentials}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope,
    }).toString(),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(
      `client_credentials token fetch failed (${scope}): ${res.status} ${err}`
    );
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
}

export async function getContentToken(): Promise<string> {
  if (!cachedContentToken || Date.now() >= cachedContentToken.expiresAt) {
    cachedContentToken = await fetchToken("content");
  }
  return cachedContentToken.accessToken;
}

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

export function qfHeaders(token: string) {
  return {
    "x-auth-token": token,
    "x-client-id": CLIENT_ID,
    "Content-Type": "application/json",
  };
}

export const QF_API_BASE =
  process.env.QF_ENV === "production"
    ? "https://apis.quran.foundation"
    : "https://apis-prelive.quran.foundation";