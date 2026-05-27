import { NextRequest, NextResponse } from "next/server";
import { getAllTags } from "@/lib/prompts";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;

  try {
    const tags = await getAllTags(auth.user.userId);
    return NextResponse.json(tags);
  } catch (error) {
    console.error("GET /api/prompts/tags error:", error);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}
