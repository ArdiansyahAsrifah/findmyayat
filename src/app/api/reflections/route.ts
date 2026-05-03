import { NextRequest, NextResponse } from "next/server";
import { getReflectToken, qfHeaders, QF_API_BASE } from "@/lib/contentToken";
import { getValidAccessToken } from "@/lib/tokenRefresh";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const surah = searchParams.get("surah");
  const verse = searchParams.get("verse");
  const limit = searchParams.get("limit") ?? "3";

  const token = await getValidAccessToken();
  if (!token) {
    return NextResponse.json({ data: [], total: 0, error: "not_logged_in" });
  }

  if (!surah || !verse) {
    return NextResponse.json({ error: "Missing surah or verse" }, { status: 400 });
  }

  try {
    const token = await getReflectToken();

    const url = `${QF_API_BASE}/quran-reflect/v1/posts?filter[ayah]=${surah}:${verse}&page[limit]=${limit}&locale=en`;

    const res = await fetch(url, {
      headers: qfHeaders(token),
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("QuranReflect API error:", res.status, errText);

      // 🔥 handle scope issue
      if (res.status === 403) {
        return NextResponse.json({
          data: [],
          total: 0,
          error: "scope_not_enabled",
        });
      }

      return NextResponse.json({
        data: [],
        total: 0,
        error: "unknown_error",
      });
    }

    const json = await res.json();

    const posts = json.data ?? json.posts ?? [];
    const total = json.meta?.total ?? json.total ?? posts.length;

    const data = posts.map((p: any) => ({
      id: p.id,
      body: p.body ?? p.text ?? "",
      createdAt: p.created_at ?? p.createdAt ?? "",
      likesCount: p.likes_count ?? p.likesCount ?? 0,
      commentsCount: p.comments_count ?? p.commentsCount ?? 0,
      postTypeName: p.post_type_name ?? p.type ?? "reflection",
      author: p.author
        ? {
            username: p.author.username ?? "",
            firstName: p.author.first_name ?? p.author.firstName ?? null,
            lastName: p.author.last_name ?? p.author.lastName ?? null,
            verified: p.author.verified ?? false,
            avatar: p.author.avatar ?? p.author.profile_picture ?? null,
          }
        : null,
    }));

    return NextResponse.json({ data, total });
  } catch (err) {
    console.error("Reflections route error:", err);

    return NextResponse.json({
      data: [],
      total: 0,
      error: "network_error",
    });
  }
}