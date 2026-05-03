import { NextResponse } from "next/server";
import { QF_API_BASE, getContentToken, qfHeaders } from "@/lib/contentToken";

export async function GET() {
  const token = await getContentToken();
  const res = await fetch(
    `${QF_API_BASE}/content/api/v4/resources/tafsirs`,
    { headers: qfHeaders(token) }
  );
  const data = await res.json();
  return NextResponse.json(data);
}