import { NextRequest, NextResponse } from "next/server";
import { getProjectChain } from "@/lib/projects";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;

  try {
    const chain = await getProjectChain(id, auth.user.userId);
    if (!chain) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(chain);
  } catch (error) {
    console.error("GET /api/projects/[id]/chain error:", error);
    return NextResponse.json({ error: "Failed to fetch project chain" }, { status: 500 });
  }
}
