/**
 * app/api/reflections/route.ts
 *
 * Fetches public QuranReflect reflections for a specific verse.
 * Uses client_credentials (post.read scope) — no user login needed.
 *
 * GET /api/reflections?surah=2&verse=255&limit=3
 */

import { NextRequest, NextResponse } from "next/server";
import { getReflectToken, qfHeaders, QF_API_BASE } from "@/lib/contentToken";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const surah = url.searchParams.get("surah");
  const verse = url.searchParams.get("verse");
  const limit = url.searchParams.get("limit") ?? "3";

  if (!surah || !verse) {
    return NextResponse.json(
      { error: "Missing surah or verse param" },
      { status: 400 }
    );
  }

  try {
    const token = await getReflectToken();

    // Filter posts by this specific ayah reference
    // references format: [{ chapterId, from, to }]
    const params = new URLSearchParams({
      tab: "newest",
      limit,
      page: "1",
    });

    // Add reference filter as array param
    params.append("references[0][chapterId]", surah);
    params.append("references[0][from]", verse);
    params.append("references[0][to]", verse);

    const res = await fetch(
      `${QF_API_BASE}/quran-reflect/v1/posts/feed?${params.toString()}`,
      {
        headers: qfHeaders(token),
        next: { revalidate: 300 }, // cache for 5 minutes
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("QuranReflect API error:", res.status, err);
      return NextResponse.json({ data: [] }, { status: 200 }); // graceful empty
    }

    const data = await res.json();

    // Return only the fields we need for display
    const posts = (data?.data ?? []).map((post: any) => ({
      id: post.id,
      body: post.body,
      createdAt: post.createdAt,
      likesCount: post.likesCount ?? 0,
      commentsCount: post.commentsCount ?? 0,
      postTypeName: post.postTypeName ?? "reflection", // "reflection" or "lesson"
      author: post.author
        ? {
            username: post.author.username,
            firstName: post.author.firstName,
            lastName: post.author.lastName,
            verified: post.author.verified ?? false,
            avatar: post.author.avatarUrls?.small ?? null,
          }
        : null,
    }));

    return NextResponse.json({ data: posts, total: data?.total ?? 0 });
  } catch (err) {
    console.error("Reflections fetch error:", err);
    return NextResponse.json({ data: [] }); // graceful empty on error
  }
}