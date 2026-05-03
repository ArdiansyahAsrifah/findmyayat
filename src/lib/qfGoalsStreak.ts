import { QF_API_BASE } from "@/lib/contentToken";

const CLIENT_ID = process.env.QF_CLIENT_ID ?? "";

function userHeaders(accessToken: string) {
  return {
    "x-auth-token": accessToken,
    "x-client-id": CLIENT_ID,
    "Content-Type": "application/json",
  };
}

// ── STREAK ───────────────────────────────────────────────────
export async function getQFStreak(accessToken: string) {
  const url = `${QF_API_BASE}/auth/v1/streaks?first=1`;
  const res = await fetch(url, {
    headers: userHeaders(accessToken),
    cache: "no-store",
  });

  const text = await res.text();
  console.log("[getQFStreak] response:", res.status, text);

  if (!res.ok) throw new Error(`Get streak failed: ${res.status} ${text}`);

  const json = JSON.parse(text);
  const item = json.data?.[0] ?? null;
  
  // ✅ Mapping ke shape yang konsisten
  if (!item) return null;
  return {
    currentStreak: item.days ?? 0,
    longestStreak: item.days ?? 0, // API ini tidak return longestStreak, pakai days saja
  };
}

// ── ACTIVITY DAY ─────────────────────────────────────────────
export async function recordQFActivityDay(
  accessToken: string,
  surahNumber: number = 1,
  verseNumber: number = 1
) {
  const today = new Date().toISOString().split("T")[0];
  const url = `${QF_API_BASE}/auth/v1/activity-days`;

  const body = {
    date: today,
    type: "QURAN",
    seconds: 60,
    ranges: [`${surahNumber}:${verseNumber}-${surahNumber}:${verseNumber}`], 
    mushafId: 1,
  };

  console.log("[recordActivityDay] posting:", body);

  const res = await fetch(url, {
    method: "POST",
    headers: userHeaders(accessToken),
    body: JSON.stringify(body),
  });

  const text = await res.text();
  console.log("[recordActivityDay] response:", res.status, text);

  if (!res.ok) throw new Error(`Record activity day failed: ${res.status} ${text}`);
  return JSON.parse(text);
}

// ── GOALS ────────────────────────────────────────────────────
export async function getQFTodayGoal(accessToken: string) {
  const url = `${QF_API_BASE}/auth/v1/goals/today`;
  const res = await fetch(url, {
    headers: userHeaders(accessToken),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Get today goal failed: ${res.status} ${err}`);
  }
  return res.json();
}