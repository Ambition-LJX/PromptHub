import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/config/db";
import { parseJsonArray } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const prompt = await prisma.prompt.findUnique({
      where: { id, visibility: "SHARED" },
      include: {
        user: {
          select: {
            username: true,
            image: true,
          },
        },
      },
    });
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found or not public" }, { status: 404 });
    }
    
    return NextResponse.json({
      id: prompt.id,
      title: prompt.title,
      content: prompt.content,
      description: prompt.description,
      language: parseJsonArray(prompt.language),
      role: parseJsonArray(prompt.role),
      stage: parseJsonArray(prompt.stage),
      tags: parseJsonArray(prompt.tags),
      visibility: "SHARED",
      userId: prompt.userId,
      user: {
        username: prompt.user.username,
        image: prompt.user.image,
      },
      createdAt: prompt.createdAt.toISOString(),
      updatedAt: prompt.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("GET /api/public/prompts/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch public prompt" }, { status: 500 });
  }
}
