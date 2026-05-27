import { prisma } from "@/config/db";
import { parseJsonArray } from "@/lib/utils";
import type { Workspace } from "@/types";

function parsePromptRow(p: {
  id: string; title: string; content: string; description: string | null;
  language: string; role: string; stage: string; tags: string;
  isFavorite: boolean; versions: string; createdAt: Date; updatedAt: Date;
}) {
  return {
    id: p.id, title: p.title, content: p.content, description: p.description,
    language: parseJsonArray(p.language), role: parseJsonArray(p.role),
    stage: parseJsonArray(p.stage), tags: parseJsonArray(p.tags),
    isFavorite: p.isFavorite, versions: parseJsonArray(p.versions),
    createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString(),
  };
}

export async function getWorkspaces(userId: string) {
  const teamMemberships = await prisma.teamMember.findMany({
    where: { userId },
    select: { teamId: true },
  });
  const teamIds = teamMemberships.map((m) => m.teamId);

  const rows = await prisma.workspace.findMany({
    where: {
      OR: [
        { userId },
        ...(teamIds.length > 0
          ? [{ visibility: "SHARED" as const, userId: { not: userId } }]
          : []),
      ],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      workspacePrompts: {
        orderBy: { order: "asc" },
        include: { prompt: true },
      },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    visibility: r.visibility,
    prompts: r.workspacePrompts.map((wp) => parsePromptRow(wp.prompt)),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function createWorkspace(data: {
  name: string;
  description?: string;
  promptIds?: string[];
  visibility?: string;
  userId: string;
}) {
  const row = await prisma.workspace.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      visibility: (data.visibility as "PRIVATE" | "TEAM" | "SHARED") ?? "PRIVATE",
      userId: data.userId,
      workspacePrompts: {
        create: (data.promptIds ?? []).map((promptId, index) => ({
          promptId,
          order: index,
        })),
      },
    },
    include: {
      workspacePrompts: {
        orderBy: { order: "asc" },
        include: { prompt: true },
      },
    },
  });

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    visibility: row.visibility,
    prompts: row.workspacePrompts.map((wp) => parsePromptRow(wp.prompt)),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function deleteWorkspace(id: string, userId: string) {
  const workspace = await prisma.workspace.findUnique({ where: { id } });
  if (!workspace || workspace.userId !== userId) return false;
  await prisma.workspace.delete({ where: { id } });
  return true;
}

export async function updateWorkspacePrompts(id: string, promptIds: string[], userId: string) {
  const workspace = await prisma.workspace.findUnique({ where: { id } });
  if (!workspace || workspace.userId !== userId) return false;

  await prisma.$transaction([
    prisma.workspacePrompt.deleteMany({ where: { workspaceId: id } }),
    ...(promptIds.length > 0
      ? [prisma.workspacePrompt.createMany({
          data: promptIds.map((promptId, index) => ({
            workspaceId: id,
            promptId,
            order: index,
          })),
        })]
      : []),
  ]);

  return true;
}

export async function updateWorkspace(
  id: string,
  data: { name?: string; description?: string; visibility?: string },
  userId: string
) {
  const workspace = await prisma.workspace.findUnique({ where: { id } });
  if (!workspace || workspace.userId !== userId) return null;

  const updated = await prisma.workspace.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      visibility: data.visibility as "PRIVATE" | "TEAM" | "SHARED",
    },
  });

  return updated;
}

export async function getWorkspace(id: string, userId: string) {
  const teamMemberships = await prisma.teamMember.findMany({
    where: { userId },
    select: { teamId: true },
  });
  const teamIds = teamMemberships.map((m) => m.teamId);

  const workspace = await prisma.workspace.findUnique({
    where: { id },
    include: {
      workspacePrompts: {
        orderBy: { order: "asc" },
        include: { prompt: true },
      },
    },
  });

  if (!workspace) return null;

  const canAccess =
    workspace.userId === userId ||
    (workspace.visibility === "SHARED" && workspace.userId !== userId);

  if (!canAccess) return null;

  return {
    id: workspace.id,
    name: workspace.name,
    description: workspace.description,
    visibility: workspace.visibility,
    prompts: workspace.workspacePrompts.map((wp) => parsePromptRow(wp.prompt)),
    createdAt: workspace.createdAt.toISOString(),
    updatedAt: workspace.updatedAt.toISOString(),
  };
}
