import { NextRequest, NextResponse } from "next/server";
import { updateProjectStage } from "@/lib/projects";
import { requireAuth } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ stageId: string }> }
) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;
  const { stageId } = await params;

  try {
    const body = await request.json();
    const success = await updateProjectStage(
      stageId,
      {
        name: body.name,
        promptIds: body.promptIds,
        primaryPromptId: body.primaryPromptId,
      },
      auth.user.userId
    );
    if (!success) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/projects/stages/[stageId] error:", error);
    return NextResponse.json({ error: "Failed to update stage" }, { status: 500 });
  }
}
