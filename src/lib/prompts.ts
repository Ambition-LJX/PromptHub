import { prisma } from "@/config/db";
import { parseJsonArray, stringifyJsonArray } from "@/lib/utils";
import type { Prompt, PromptCreateInput, PromptUpdateInput, PromptVersion } from "@/types";

function toPrompt(raw: {
  id: string;
  title: string;
  content: string;
  description: string | null;
  language: string;
  role: string;
  stage: string;
  tags: string;
  isFavorite: boolean;
  versions: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  visibility: string;
}): Prompt {
  return {
    id: raw.id,
    title: raw.title,
    content: raw.content,
    description: raw.description,
    language: parseJsonArray(raw.language),
    role: parseJsonArray(raw.role),
    stage: parseJsonArray(raw.stage),
    tags: parseJsonArray(raw.tags),
    isFavorite: raw.isFavorite,
    versions: parseJsonArray(raw.versions) as unknown as PromptVersion[],
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };
}

export async function getPrompts(params?: {
  search?: string;
  language?: string;
  role?: string;
  stage?: string;
  tag?: string;
  isFavorite?: boolean;
  page?: number;
  pageSize?: number;
  userId: string;
}) {
  const teamMemberships = await prisma.teamMember.findMany({
    where: { userId: params?.userId ?? "" },
    select: { teamId: true },
  });
  const teamIds = teamMemberships.map((m) => m.teamId);

  const where: Record<string, unknown> = {
    OR: [
      { userId: params?.userId },
      ...(teamIds.length > 0
        ? [
            {
              visibility: "SHARED" as const,
              userId: { not: params?.userId },
            },
          ]
        : []),
    ],
  };

  if (params?.search) {
    where.AND = [
      {
        OR: [
          { title: { contains: params.search } },
          { content: { contains: params.search } },
          { description: { contains: params.search } },
          { tags: { contains: params.search } },
        ],
      },
    ];
  }

  if (params?.language) where.language = { contains: params.language };
  if (params?.role) where.role = { contains: params.role };
  if (params?.stage) where.stage = { contains: params.stage };
  if (params?.tag) where.tags = { contains: params.tag };
  if (params?.isFavorite !== undefined) where.isFavorite = params.isFavorite;

  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 50));
  const skip = (page - 1) * pageSize;

  const [rows, total] = await Promise.all([
    prisma.prompt.findMany({
      where,
      orderBy: [{ isFavorite: "desc" }, { updatedAt: "desc" }],
      skip,
      take: pageSize,
    }),
    prisma.prompt.count({ where }),
  ]);

  return {
    prompts: rows.map(toPrompt),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getPrompt(id: string, userId: string) {
  const row = await prisma.prompt.findUnique({ where: { id } });
  if (!row) return null;

  const canAccess =
    row.userId === userId ||
    row.visibility === "SHARED" ||
    (row.visibility === "TEAM" &&
      (await prisma.teamMember.findFirst({
        where: { userId, teamId: row.userId },
      })));

  if (!canAccess) return null;

  return toPrompt(row);
}

export async function createPrompt(input: PromptCreateInput & { userId: string; visibility?: string }) {
  const row = await prisma.prompt.create({
    data: {
      title: input.title,
      content: input.content,
      description: input.description ?? null,
      language: stringifyJsonArray(input.language ?? []),
      role: stringifyJsonArray(input.role ?? []),
      stage: stringifyJsonArray(input.stage ?? []),
      tags: stringifyJsonArray(input.tags ?? []),
      versions: stringifyJsonArray([]),
      userId: input.userId,
      visibility: (input.visibility as "PRIVATE" | "TEAM" | "SHARED") ?? "PRIVATE",
    },
  });
  return toPrompt(row);
}

export async function updatePrompt(
  id: string,
  input: PromptUpdateInput,
  userId: string
) {
  const existing = await prisma.prompt.findUnique({ where: { id } });
  if (!existing) return null;
  if (existing.userId !== userId) return null;

  const current = toPrompt(existing);
  let versions = current.versions;

  if (input.content && input.content !== current.content) {
    versions = [
      ...versions,
      {
        content: current.content,
        description: `v${versions.length + 1}`,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  const data: Record<string, unknown> = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.content !== undefined) data.content = input.content;
  if (input.description !== undefined) data.description = input.description ?? null;
  if (input.language !== undefined) data.language = stringifyJsonArray(input.language);
  if (input.role !== undefined) data.role = stringifyJsonArray(input.role);
  if (input.stage !== undefined) data.stage = stringifyJsonArray(input.stage);
  if (input.tags !== undefined) data.tags = stringifyJsonArray(input.tags);
  if (input.isFavorite !== undefined) data.isFavorite = input.isFavorite;
  if (input.visibility !== undefined) data.visibility = input.visibility;
  if (input.content !== undefined) data.versions = stringifyJsonArray(versions as unknown as string[]);

  const row = await prisma.prompt.update({ where: { id }, data });
  return toPrompt(row);
}

export async function deletePrompt(id: string, userId: string) {
  const prompt = await prisma.prompt.findUnique({ where: { id } });
  if (!prompt || prompt.userId !== userId) return false;
  await prisma.prompt.delete({ where: { id } });
  return true;
}

export async function getAllTags(userId: string) {
  const teamMemberships = await prisma.teamMember.findMany({
    where: { userId },
    select: { teamId: true },
  });
  const teamIds = teamMemberships.map((m) => m.teamId);

  const rows = await prisma.prompt.findMany({
    where: {
      OR: [
        { userId },
        ...(teamIds.length > 0
          ? [{ visibility: "SHARED" as const, userId: { not: userId } }]
          : []),
      ],
    },
    select: { tags: true },
  });

  const tagSet = new Set<string>();
  rows.forEach((r) => {
    parseJsonArray(r.tags).forEach((t) => tagSet.add(t));
  });
  return Array.from(tagSet).sort();
}

export async function getPromptPickerPrompts(userId: string, page = 1, pageSize = 100) {
  const teamMemberships = await prisma.teamMember.findMany({
    where: { userId },
    select: { teamId: true },
  });
  const teamIds = teamMemberships.map((m) => m.teamId);

  const skip = (Math.max(1, page) - 1) * pageSize;

  const rows = await prisma.prompt.findMany({
    where: {
      OR: [
        { userId },
        ...(teamIds.length > 0
          ? [{ visibility: "SHARED" as const, userId: { not: userId } }]
          : []),
      ],
    },
    orderBy: [{ isFavorite: "desc" }, { updatedAt: "desc" }],
    select: { id: true, title: true, content: true },
    skip,
    take: pageSize,
  });

  const total = await prisma.prompt.count({
    where: {
      OR: [
        { userId },
        ...(teamIds.length > 0
          ? [{ visibility: "SHARED" as const, userId: { not: userId } }]
          : []),
      ],
    },
  });

  return { prompts: rows, total };
}
