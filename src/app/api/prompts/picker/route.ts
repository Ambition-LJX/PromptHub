import { NextRequest, NextResponse } from "next/server";
import { getPromptPickerPrompts } from "@/lib/prompts";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") ?? "100", 10));

    const result = await getPromptPickerPrompts(auth.user.userId, page, pageSize);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/prompts/picker error:", error);
    return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 });
  }
}
