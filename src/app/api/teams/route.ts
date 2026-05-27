import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/config/db";
import { requireAuth, forbidden } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;

  const teams = await prisma.team.findMany({
    where: {
      members: { some: { userId: auth.user.userId } },
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, username: true, email: true } },
        },
      },
      _count: { select: { promptAccesses: true, workspaceAccesses: true, projectAccesses: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(teams);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || name.trim().length < 1) {
      return NextResponse.json({ error: "团队名称不能为空" }, { status: 400 });
    }

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        members: {
          create: {
            userId: auth.user.userId,
            role: "OWNER",
          },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, username: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error("POST /api/teams error:", error);
    return NextResponse.json({ error: "创建团队失败" }, { status: 500 });
  }
}
