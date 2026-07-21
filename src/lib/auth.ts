import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/config/db";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-change-me"
);
const TOKEN_COOKIE = "auth_token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? "7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(response: NextResponse, token: string) {
  const isSecure =
    process.env.NODE_ENV === "production" && !process.env.OAUTH_INSECURE_COOKIE;
  response.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.delete(TOKEN_COOKIE);
}

export async function getAuthFromRequest(
  request: NextRequest
): Promise<JWTPayload | null> {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getAuthUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export async function requireAuth(
  request: NextRequest
): Promise<{ user: JWTPayload; response?: never } | { user?: never; response: NextResponse }> {
  const user = await getAuthFromRequest(request);
  if (!user) {
    return { response: unauthorized() };
  }
  return { user };
}

export async function getAccessiblePromptIds(userId: string): Promise<Set<string>> {
  const owned = await prisma.prompt.findMany({
    where: { userId },
    select: { id: true },
  });

  const teamMemberships = await prisma.teamMember.findMany({
    where: { userId },
    select: { teamId: true },
  });
  const teamIds = teamMemberships.map((m) => m.teamId);

  let shared: string[] = [];
  if (teamIds.length > 0) {
    const accesses = await prisma.promptAccess.findMany({
      where: { teamId: { in: teamIds } },
      select: { promptId: true },
    });
    shared = accesses.map((a) => a.promptId);
  }

  const allIds = [...owned.map((p) => p.id), ...shared];
  return new Set(allIds);
}

export async function canAccessPrompt(userId: string, promptId: string): Promise<boolean> {
  const accessible = await getAccessiblePromptIds(userId);
  return accessible.has(promptId);
}

export async function canEditPrompt(userId: string, promptId: string): Promise<boolean> {
  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
    select: { userId: true, visibility: true },
  });
  if (!prompt) return false;
  if (prompt.userId === userId) return true;

  if (prompt.visibility === "SHARED") return true;

  if (prompt.visibility === "TEAM") {
    const isTeamMember = await prisma.teamMember.findFirst({
      where: { userId, teamId: prompt.userId },
    });
    return !!isTeamMember;
  }

  return false;
}

export async function canAccessWorkspace(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { userId: true, visibility: true },
  });
  if (!workspace) return false;
  if (workspace.userId === userId) return true;

  if (workspace.visibility === "SHARED") {
    const teamMemberships = await prisma.teamMember.findMany({
      where: { userId },
      select: { teamId: true },
    });
    const teamIds = teamMemberships.map((m) => m.teamId);
    if (teamIds.length === 0) return false;

    const access = await prisma.workspaceAccess.findFirst({
      where: { workspaceId, teamId: { in: teamIds } },
    });
    return !!access;
  }

  return false;
}

export async function canEditWorkspace(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { userId: true },
  });
  if (!workspace) return false;
  return workspace.userId === userId;
}

export async function canAccessProject(
  userId: string,
  projectId: string
): Promise<boolean> {
  const project = await prisma.projectTemplate.findUnique({
    where: { id: projectId },
    select: { userId: true, visibility: true },
  });
  if (!project) return false;
  if (project.userId === userId) return true;

  if (project.visibility === "SHARED") {
    const teamMemberships = await prisma.teamMember.findMany({
      where: { userId },
      select: { teamId: true },
    });
    const teamIds = teamMemberships.map((m) => m.teamId);
    if (teamIds.length === 0) return false;

    const access = await prisma.projectAccess.findFirst({
      where: { projectTemplateId: projectId, teamId: { in: teamIds } },
    });
    return !!access;
  }

  return false;
}

export async function canEditProject(
  userId: string,
  projectId: string
): Promise<boolean> {
  const project = await prisma.projectTemplate.findUnique({
    where: { id: projectId },
    select: { userId: true },
  });
  if (!project) return false;
  return project.userId === userId;
}
