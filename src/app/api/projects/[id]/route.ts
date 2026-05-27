import { NextRequest, NextResponse } from "next/server";
import { getProject, deleteProject, updateProject } from "@/lib/projects";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;

  try {
    const project = await getProject(id, auth.user.userId);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(project);
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
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
    const project = await updateProject(id, body, auth.user.userId);
    if (!project) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
    return NextResponse.json(project);
  } catch (error) {
    console.error("PUT /api/projects/[id] error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
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
    const success = await deleteProject(id, auth.user.userId);
    if (!success) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
