import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/config/db";
import { requireAuth, forbidden } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;
  const { id: promptId } = await params;

  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
    select: { userId: true },
  });
  if (!prompt || prompt.userId !== auth.user.userId) {
    return forbidden("只有提示词所有者可以共享");
  }

  const body = await request.json();
  const { teamId, canEdit } = body;

  if (!teamId) {
    return NextResponse.json({ error: "teamId is required" }, { status: 400 });
  }

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: auth.user.userId, teamId } },
  });
  if (!membership || membership.role !== "OWNER") {
    return forbidden("只有团队所有者可以共享到团队");
  }

  const access = await prisma.promptAccess.upsert({
    where: { promptId_teamId: { promptId, teamId } },
    update: { canEdit: canEdit ?? false },
    create: { promptId, teamId, canEdit: canEdit ?? false },
  });

  await prisma.prompt.update({
    where: { id: promptId },
    data: { visibility: "SHARED" },
  });

  return NextResponse.json(access, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;
  const { id: promptId } = await params;
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");

  if (!teamId) {
    return NextResponse.json({ error: "teamId is required" }, { status: 400 });
  }

  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
    select: { userId: true },
  });
  if (!prompt || prompt.userId !== auth.user.userId) {
    return forbidden();
  }

  await prisma.promptAccess.deleteMany({
    where: { promptId, teamId },
  });

  return NextResponse.json({ success: true });
}
