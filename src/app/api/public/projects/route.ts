import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/config/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));
    
    const where: Record<string, unknown> = {
      visibility: "SHARED" as const,
    };
    
    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        },
      ];
    }
    
    const skip = (page - 1) * pageSize;
    
    const [rows, total] = await Promise.all([
      prisma.projectTemplate.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          description: true,
          visibility: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              username: true,
              image: true,
            },
          },
        },
      }),
      prisma.projectTemplate.count({ where }),
    ]);
    
    return NextResponse.json({
      projects: rows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("GET /api/public/projects error:", error);
    return NextResponse.json({ error: "Failed to fetch public projects" }, { status: 500 });
  }
}
