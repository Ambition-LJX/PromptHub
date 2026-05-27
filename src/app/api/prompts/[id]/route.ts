import { NextRequest, NextResponse } from "next/server";
import { getPrompt, updatePrompt, deletePrompt } from "@/lib/prompts";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;

  try {
    const prompt = await getPrompt(id, auth.user.userId);
    if (!prompt) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(prompt);
  } catch (error) {
    console.error("GET /api/prompts/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch prompt" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;

  try {
    const body = await request.json();
    const prompt = await updatePrompt(id, body, auth.user.userId);
    if (!prompt) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
    return NextResponse.json(prompt);
  } catch (error) {
    console.error("PUT /api/prompts/[id] error:", error);
    return NextResponse.json({ error: "Failed to update prompt" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;

  try {
    const success = await deletePrompt(id, auth.user.userId);
    if (!success) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/prompts/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete prompt" }, { status: 500 });
  }
}
