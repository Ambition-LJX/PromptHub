import { prisma } from "@/config/db";
import { parseJsonArray } from "@/lib/utils";
import type { ProjectTemplate, ProjectStage } from "@/types";

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

function toProject(raw: {
  id: string;
  name: string;
  description: string | null;
  stages: string;
  visibility: string;
  createdAt: Date;
  updatedAt: Date;
}): ProjectTemplate {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    stages: parseJsonArray(raw.stages) as unknown as ProjectStage[],
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };
}

export async function getProjects(userId: string) {
  const teamMemberships = await prisma.teamMember.findMany({
    where: { userId },
    select: { teamId: true },
  });
  const teamIds = teamMemberships.map((m) => m.teamId);

  const rows = await prisma.projectTemplate.findMany({
    where: {
      OR: [
        { userId },
        ...(teamIds.length > 0
          ? [{ visibility: "SHARED" as const, userId: { not: userId } }]
          : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      projectStages: {
        orderBy: { order: "asc" },
        include: { prompt: true },
      },
    },
  });

  return rows.map((r) => {
    const project = toProject(r);
    return {
      ...project,
      visibility: r.visibility,
      stages: r.projectStages.map((s) => ({
        id: s.id,
        projectTemplateId: s.projectTemplateId,
        name: s.name,
        order: s.order,
        promptIds: parseJsonArray(s.promptIds),
        primaryPromptId: s.primaryPromptId,
        prompt: s.prompt ? parsePromptRow(s.prompt) : undefined,
      })),
    };
  });
}

export async function getProject(id: string, userId: string) {
  const teamMemberships = await prisma.teamMember.findMany({
    where: { userId },
    select: { teamId: true },
  });
  const teamIds = teamMemberships.map((m) => m.teamId);

  const raw = await prisma.projectTemplate.findUnique({
    where: { id },
    include: {
      projectStages: {
        orderBy: { order: "asc" },
        include: { prompt: true },
      },
    },
  });

  if (!raw) return null;

  const canAccess =
    raw.userId === userId ||
    (raw.visibility === "SHARED" && raw.userId !== userId);

  if (!canAccess) return null;

  const project = toProject(raw);
  return {
    ...project,
    visibility: raw.visibility,
    stages: raw.projectStages.map((s) => ({
      id: s.id,
      projectTemplateId: s.projectTemplateId,
      name: s.name,
      order: s.order,
      promptIds: parseJsonArray(s.promptIds),
      primaryPromptId: s.primaryPromptId,
      prompt: s.prompt ? parsePromptRow(s.prompt) : undefined,
    })),
  };
}

export async function createProject(data: { name: string; description?: string; visibility?: string; userId: string }) {
  const row = await prisma.projectTemplate.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      visibility: (data.visibility as "PRIVATE" | "TEAM" | "SHARED") ?? "PRIVATE",
      userId: data.userId,
      stages: "[]",
    },
  });

  const defaultStages = [
    "需求分析", "架构设计", "技术选型", "编码", "代码审查", "测试", "部署", "运维监控"
  ];

  for (let i = 0; i < defaultStages.length; i++) {
    await prisma.projectStage.create({
      data: {
        projectTemplateId: row.id,
        name: defaultStages[i],
        order: i,
        promptIds: "[]",
      },
    });
  }

  return getProject(row.id, data.userId);
}

export async function updateProject(
  id: string,
  data: { name?: string; description?: string; visibility?: string },
  userId: string
) {
  const project = await prisma.projectTemplate.findUnique({ where: { id } });
  if (!project || project.userId !== userId) return null;

  const updated = await prisma.projectTemplate.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      visibility: data.visibility as "PRIVATE" | "TEAM" | "SHARED",
    },
  });

  return updated;
}

export async function updateProjectStage(
  stageId: string,
  data: { name?: string; promptIds?: string[]; primaryPromptId?: string | null },
  userId: string
) {
  const stage = await prisma.projectStage.findUnique({
    where: { id: stageId },
    include: { projectTemplate: { select: { userId: true } } },
  });
  if (!stage || stage.projectTemplate.userId !== userId) return false;

  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.promptIds !== undefined) update.promptIds = JSON.stringify(data.promptIds);
  if (data.primaryPromptId !== undefined) update.primaryPromptId = data.primaryPromptId;

  await prisma.projectStage.update({ where: { id: stageId }, data: update });
  return true;
}

export async function deleteProject(id: string, userId: string) {
  const project = await prisma.projectTemplate.findUnique({ where: { id } });
  if (!project || project.userId !== userId) return false;
  await prisma.projectTemplate.delete({ where: { id } });
  return true;
}

export async function getProjectChain(id: string, userId: string) {
  const project = await getProject(id, userId);
  if (!project) return null;

  const allPromptIds = project.stages.flatMap((s) => s.promptIds);
  const uniqueIds = [...new Set(allPromptIds)];

  const promptsMap = new Map<string, object>();
  if (uniqueIds.length > 0) {
    const rows = await prisma.prompt.findMany({
      where: { id: { in: uniqueIds } },
    });
    rows.forEach((p) => {
      promptsMap.set(p.id, parsePromptRow(p));
    });
  }

  const stagePrompts = project.stages.map((stage) => ({
    stage,
    prompts: stage.promptIds
      .map((pid) => promptsMap.get(pid))
      .filter(Boolean),
  }));

  return { project, stagePrompts };
}
