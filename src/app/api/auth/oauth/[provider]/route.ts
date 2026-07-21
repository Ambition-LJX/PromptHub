import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthorizeUrl,
  generateState,
  getCallbackBaseUrl,
  getProviderConfig,
  isProviderConfigured,
  isSecureContext,
  type OAuthProvider,
} from "@/lib/oauth";

const STATE_COOKIE = "oauth_state";
const STATE_MAX_AGE = 60 * 10; // 10 分钟

/**
 * GET /api/auth/oauth/[provider]
 * 发起 OAuth 授权：生成 state → 写 cookie → 重定向到 provider 授权页
 *
 * 注意：错误重定向地址基于 OAUTH_CALLBACK_BASE_URL 构造，
 * 避免在 Docker 环境下使用 request.nextUrl.origin（会是 0.0.0.0:3000）。
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const requestOrigin = request.nextUrl.origin;
  const baseUrl = getCallbackBaseUrl();
  const secure = isSecureContext(requestOrigin);

  try {
    getProviderConfig(provider);
  } catch {
    return NextResponse.redirect(
      new URL(`/auth/result?status=error&error=unsupported_provider`, baseUrl)
    );
  }

  if (!isProviderConfigured(provider as OAuthProvider)) {
    return NextResponse.redirect(
      new URL(
        `/auth/result?status=error&error=provider_not_configured&provider=${provider}`,
        baseUrl
      )
    );
  }

  const state = generateState();
  const authorizeUrl = buildAuthorizeUrl(provider as OAuthProvider, state, baseUrl);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: STATE_MAX_AGE,
    path: "/",
  });

  return response;
}
