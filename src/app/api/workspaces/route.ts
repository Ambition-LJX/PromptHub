import { NextRequest, NextResponse } from "next/server";
import { getWorkspaces, createWorkspace } from "@/lib/workspaces";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;

  try {
    const workspaces = await getWorkspaces(auth.user.userId);
    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("GET /api/workspaces error:", error);
    return NextResponse.json({ error: "Failed to fetch workspaces" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const workspace = await createWorkspace({
      name: body.name,
      description: body.description,
      promptIds: body.promptIds,
      visibility: body.visibility,
      userId: auth.user.userId,
    });
    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error("POST /api/workspaces error:", error);
    return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 });
  }
}
