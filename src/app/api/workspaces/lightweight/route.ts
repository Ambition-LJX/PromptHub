import { NextRequest, NextResponse } from "next/server";
import { getWorkspaces } from "@/lib/workspaces";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") ?? "50", 10));

    const all = await getWorkspaces(auth.user.userId);
    const total = all.length;
    const skip = (Math.max(1, page) - 1) * pageSize;
    const rows = all.slice(skip, skip + pageSize);

    const workspaces = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      visibility: r.visibility,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return NextResponse.json({
      workspaces,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("GET /api/workspaces/lightweight error:", error);
    return NextResponse.json({ error: "Failed to fetch workspaces" }, { status: 500 });
  }
}
