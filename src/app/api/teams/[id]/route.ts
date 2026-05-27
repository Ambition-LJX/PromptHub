import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/config/db";
import { requireAuth, forbidden, notFound } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: { select: { id: true, username: true, email: true } },
        },
      },
    },
  });

  if (!team) return notFound("团队不存在");

  const isMember = team.members.some((m) => m.userId === auth.user.userId);
  if (!isMember) return forbidden("不是团队成员");

  return NextResponse.json(team);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;

  const member = await prisma.teamMember.findFirst({
    where: { teamId: id, userId: auth.user.userId, role: "OWNER" },
  });
  if (!member) return forbidden("只有团队所有者可以修改团队信息");

  const body = await request.json();
  const team = await prisma.team.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
    },
  });

  return NextResponse.json(team);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;

  const member = await prisma.teamMember.findFirst({
    where: { teamId: id, userId: auth.user.userId, role: "OWNER" },
  });
  if (!member) return forbidden("只有团队所有者可以删除团队");

  await prisma.team.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
