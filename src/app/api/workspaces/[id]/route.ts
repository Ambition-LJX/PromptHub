import { NextRequest, NextResponse } from "next/server";
import {
  deleteWorkspace,
  updateWorkspacePrompts,
  getWorkspaces,
  updateWorkspace,
} from "@/lib/workspaces";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;

  try {
    const workspaces = await getWorkspaces(auth.user.userId);
    const workspace = workspaces.find((w) => w.id === id);
    if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(workspace);
  } catch (error) {
    console.error("GET /api/workspaces/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch workspace" }, { status: 500 });
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
    if (body.promptIds !== undefined) {
      await updateWorkspacePrompts(id, body.promptIds, auth.user.userId);
    }
    if (body.name !== undefined || body.description !== undefined || body.visibility !== undefined) {
      await updateWorkspace(
        id,
        { name: body.name, description: body.description, visibility: body.visibility },
        auth.user.userId
      );
    }
    const workspaces = await getWorkspaces(auth.user.userId);
    const workspace = workspaces.find((w) => w.id === id);
    if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(workspace);
  } catch (error) {
    console.error("PUT /api/workspaces/[id] error:", error);
    return NextResponse.json({ error: "Failed to update workspace" }, { status: 500 });
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
    const success = await deleteWorkspace(id, auth.user.userId);
    if (!success) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/workspaces/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete workspace" }, { status: 500 });
  }
}
