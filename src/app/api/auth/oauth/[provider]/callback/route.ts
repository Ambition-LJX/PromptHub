import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/config/db";
import { signToken, setAuthCookie } from "@/lib/auth";
import {
  exchangeCodeForToken,
  fetchUserInfo,
  getCallbackBaseUrl,
  getProviderConfig,
  type OAuthProvider,
} from "@/lib/oauth";

const STATE_COOKIE = "oauth_state";

/**
 * GET /api/auth/oauth/[provider]/callback?code=xxx&state=xxx
 * OAuth 回调：校验 state → 换 token → 取用户信息 → 创建/关联用户 → 签发 JWT → 跳结果页
 *
 * 注意：所有重定向地址都基于 OAUTH_CALLBACK_BASE_URL 构造，
 * 而非 request.nextUrl.origin（在 Docker 中后者会是 0.0.0.0:3000）。
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const searchParams = request.nextUrl.searchParams;

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const githubError = searchParams.get("error");
  const githubErrorDesc = searchParams.get("error_description");

  // 统一使用 OAUTH_CALLBACK_BASE_URL 作为重定向基础地址
  // 避免在 Docker 环境下使用 request.nextUrl.origin（会是 0.0.0.0:3000）
  const baseUrl = getCallbackBaseUrl();

  try {
    getProviderConfig(provider);
  } catch {
    return redirectToResult(baseUrl, "error", "unsupported_provider");
  }

  if (githubError) {
    const desc = githubErrorDesc
      ? decodeURIComponent(githubErrorDesc)
      : githubError === "access_denied"
        ? "你拒绝了授权请求"
        : githubError;
    return redirectToResult(baseUrl, "error", "oauth_denied", desc);
  }

  if (!code || !state) {
    return redirectToResult(baseUrl, "error", "missing_params");
  }

  const cookieState = request.cookies.get(STATE_COOKIE)?.value;
  if (!cookieState) {
    return redirectToResult(
      baseUrl,
      "error",
      "state_cookie_missing",
      "登录状态已丢失，这通常是因为你使用了 0.0.0.0 而非配置的 OAUTH_CALLBACK_BASE_URL 访问应用，请使用配置的地址重新登录。"
    );
  }
  if (cookieState !== state) {
    return redirectToResult(baseUrl, "error", "invalid_state");
  }

  try {
    const accessToken = await exchangeCodeForToken(
      provider as OAuthProvider,
      code,
      baseUrl
    );
    const oauthUser = await fetchUserInfo(provider as OAuthProvider, accessToken);

    const userEmail = oauthUser.email;
    if (!userEmail) {
      return redirectToResult(baseUrl, "error", "no_email");
    }

    const existing = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    let user;
    if (existing) {
      const updateData: { provider?: string; providerAccountId?: string; image?: string } = {};
      if (!existing.provider) updateData.provider = oauthUser.provider;
      if (!existing.providerAccountId) updateData.providerAccountId = oauthUser.providerAccountId;
      if (!existing.image && oauthUser.image) updateData.image = oauthUser.image;

      user = await prisma.user.update({
        where: { id: existing.id },
        data: updateData,
        select: { id: true, username: true, email: true, role: true },
      });
    } else {
      const baseName = sanitizeUsername(
        oauthUser.name || userEmail.split("@")[0]
      );
      const username = await generateUniqueUsername(baseName);

      user = await prisma.user.create({
        data: {
          username,
          email: userEmail,
          password: null,
          provider: oauthUser.provider,
          providerAccountId: oauthUser.providerAccountId,
          image: oauthUser.image,
        },
        select: { id: true, username: true, email: true, role: true },
      });
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.redirect(
      new URL(
        `/auth/result?status=success&provider=${provider}&username=${encodeURIComponent(user.username)}`,
        baseUrl
      )
    );
    setAuthCookie(response, token);
    response.cookies.delete(STATE_COOKIE);
    response.cookies.set(STATE_COOKIE, "", { maxAge: 0, path: "/" });
    return response;
  } catch (error) {
    console.error(`OAuth ${provider} callback error:`, error);
    const msg = error instanceof Error ? error.message : String(error);
    return redirectToResult(baseUrl, "error", "callback_failed", msg);
  }
}

function redirectToResult(
  baseUrl: string,
  status: "success" | "error",
  errorCode?: string,
  detail?: string
): NextResponse {
  const url = new URL("/auth/result", baseUrl);
  url.searchParams.set("status", status);
  if (errorCode) url.searchParams.set("error", errorCode);
  if (detail) url.searchParams.set("detail", encodeURIComponent(detail));
  return NextResponse.redirect(url);
}

function sanitizeUsername(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5-]/g, "").slice(0, 24);
  return cleaned || "user";
}

async function generateUniqueUsername(base: string): Promise<string> {
  let candidate = base;
  for (let i = 0; i < 10; i++) {
    const exists = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
    candidate = `${base}_${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${base}_${Date.now().toString(36)}`;
}
