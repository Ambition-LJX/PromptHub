import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/config/db";
import { requireAuth, forbidden } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;
  const { id: teamId } = await params;

  const member = await prisma.teamMember.findFirst({
    where: { teamId, userId: auth.user.userId, role: "OWNER" },
  });
  if (!member) return forbidden("只有团队所有者可以添加成员");

  const body = await request.json();
  const { email, role } = body;

  if (!email) {
    return NextResponse.json({ error: "邮箱不能为空" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "未找到该用户" }, { status: 404 });
  }

  const existing = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: user.id, teamId } },
  });
  if (existing) {
    return NextResponse.json({ error: "该用户已在团队中" }, { status: 409 });
  }

  const newMember = await prisma.teamMember.create({
    data: {
      userId: user.id,
      teamId,
      role: role === "OWNER" ? "OWNER" : "MEMBER",
    },
    include: {
      user: { select: { id: true, username: true, email: true } },
    },
  });

  return NextResponse.json(newMember, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;
  const { id: teamId } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const currentMember = await prisma.teamMember.findFirst({
    where: { teamId, userId: auth.user.userId, role: "OWNER" },
  });
  const isRemovingSelf = userId === auth.user.userId;

  if (!currentMember && !isRemovingSelf) {
    return forbidden("无权移除成员");
  }

  if (userId === auth.user.userId) {
    const member = await prisma.teamMember.findFirst({
      where: { teamId, userId, role: "OWNER" },
    });
    if (member) {
      const ownerCount = await prisma.teamMember.count({
        where: { teamId, role: "OWNER" },
      });
      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: "团队至少需要一名所有者" },
          { status: 400 }
        );
      }
    }
  }

  await prisma.teamMember.delete({
    where: { userId_teamId: { userId, teamId } },
  });

  return NextResponse.json({ success: true });
}
