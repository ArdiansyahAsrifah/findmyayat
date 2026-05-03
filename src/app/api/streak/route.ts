// src/app/api/streak/route.ts

import { NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/tokenRefresh";
import {
  getQFStreak,
  recordQFActivityDay,
  getQFTodayGoal,
} from "@/lib/qfGoalsStreak";

// GET — ambil streak + goal (dipanggil saat Navbar render)
export async function GET() {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken)
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const [streakResult, goalResult] = await Promise.allSettled([
      getQFStreak(accessToken),
      getQFTodayGoal(accessToken),
    ]);

    return NextResponse.json({
      streak: streakResult.status === "fulfilled" ? streakResult.value : null,
      goal: goalResult.status === "fulfilled" ? goalResult.value : null,
    });
  } catch (err) {
    console.error("[GET /api/streak]", err);
    return NextResponse.json(
      { error: "Failed to fetch streak" },
      { status: 500 }
    );
  }
}

// POST — dipanggil tepat setelah ayat muncul di halaman utama
export async function POST() {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken)
      // User belum login — silent, jangan error supaya UX tidak terganggu
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    // Catat activity day — ini yang menaikkan streak
    const activityResult = await Promise.allSettled([
      recordQFActivityDay(accessToken),
    ]);

    // Ambil streak terbaru setelah dicatat
    const streak = await getQFStreak(accessToken);

    return NextResponse.json({
      success: true,
      streak,
      activityRecorded: activityResult[0].status === "fulfilled",
    });
  } catch (err) {
    console.error("[POST /api/streak]", err);
    return NextResponse.json(
      { error: "Failed to record activity" },
      { status: 500 }
    );
  }
}