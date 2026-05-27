import { NextRequest, NextResponse } from "next/server";
import { getPrompts, createPrompt } from "@/lib/prompts";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const params = {
      search: searchParams.get("search") ?? undefined,
      language: searchParams.get("language") ?? undefined,
      role: searchParams.get("role") ?? undefined,
      stage: searchParams.get("stage") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
      isFavorite: searchParams.get("isFavorite") === "true"
        ? true
        : searchParams.get("isFavorite") === "false"
          ? false
          : undefined,
      page: searchParams.has("page") ? parseInt(searchParams.get("page")!, 10) : undefined,
      pageSize: searchParams.has("pageSize") ? parseInt(searchParams.get("pageSize")!, 10) : undefined,
      userId: auth.user.userId,
    };

    const result = await getPrompts(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/prompts error:", error);
    return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const prompt = await createPrompt({
      ...body,
      userId: auth.user.userId,
    });
    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    console.error("POST /api/prompts error:", error);
    return NextResponse.json({ error: "Failed to create prompt" }, { status: 500 });
  }
}
