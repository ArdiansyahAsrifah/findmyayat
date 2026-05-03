// src/lib/qfGoalsStreak.ts

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
  const url = `${QF_API_BASE}/auth/v1/streaks?first=1`; // ← tambah ?first=1
  const res = await fetch(url, {
    headers: userHeaders(accessToken),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Get streak failed: ${res.status} ${err}`);
  }
  return res.json();
}

// ── ACTIVITY DAY ─────────────────────────────────────────────
// Dipanggil setelah user search → mencatat hari ini sebagai hari aktif
export async function recordQFActivityDay(accessToken: string) {
  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
  const url = `${QF_API_BASE}/auth/v1/activity-days`;
  const res = await fetch(url, {
    method: "POST",
    headers: userHeaders(accessToken),
    body: JSON.stringify({ date: today }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Record activity day failed: ${res.status} ${err}`);
  }
  return res.json();
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