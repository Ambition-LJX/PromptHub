import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/config/db";
import { parseJsonArray } from "@/lib/utils";
import type { Prompt } from "@/types";

interface PublicPrompt {
  id: string;
  title: string;
  content: string;
  description: string | null;
  language: string[];
  role: string[];
  stage: string[];
  tags: string[];
  visibility: "SHARED";
  userId: string;
  user: {
    username: string;
    image: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get("search") ?? undefined;
    const language = searchParams.get("language") ?? undefined;
    const role = searchParams.get("role") ?? undefined;
    const stage = searchParams.get("stage") ?? undefined;
    const tag = searchParams.get("tag") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));
    
    const where: Record<string, unknown> = {
      visibility: "SHARED" as const,
    };
    
    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search } },
            { content: { contains: search } },
            { description: { contains: search } },
            { tags: { contains: search } },
          ],
        },
      ];
    }
    
    if (language) where.language = { contains: language };
    if (role) where.role = { contains: role };
    if (stage) where.stage = { contains: stage };
    if (tag) where.tags = { contains: tag };
    
    const skip = (page - 1) * pageSize;
    
    const [rows, total] = await Promise.all([
      prisma.prompt.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              username: true,
              image: true,
            },
          },
        },
      }),
      prisma.prompt.count({ where }),
    ]);
    
    const prompts: PublicPrompt[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      description: row.description,
      language: parseJsonArray(row.language),
      role: parseJsonArray(row.role),
      stage: parseJsonArray(row.stage),
      tags: parseJsonArray(row.tags),
      visibility: "SHARED" as const,
      userId: row.userId,
      user: {
        username: row.user.username,
        image: row.user.image,
      },
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
    
    return NextResponse.json({
      prompts,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("GET /api/public/prompts error:", error);
    return NextResponse.json({ error: "Failed to fetch public prompts" }, { status: 500 });
  }
}
