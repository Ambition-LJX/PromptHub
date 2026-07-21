/**
 * OAuth 2.0 工具库
 * 目前仅支持 GitHub Provider，使用 Authorization Code 流程。
 * 复用项目现有的 jose JWT 体系，登录成功后签发与密码登录一致的 token。
 */

export type OAuthProvider = "github";

export interface OAuthUserInfo {
  provider: OAuthProvider;
  providerAccountId: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

interface ProviderConfig {
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
  getClientId: () => string;
  getClientSecret: () => string;
  parseUserInfo: (raw: any) => OAuthUserInfo;
}

const PROVIDERS: Record<OAuthProvider, ProviderConfig> = {
  github: {
    authorizeUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userInfoUrl: "https://api.github.com/user",
    scope: "read:user user:email",
    getClientId: () => process.env.GITHUB_CLIENT_ID ?? "",
    getClientSecret: () => process.env.GITHUB_CLIENT_SECRET ?? "",
    parseUserInfo: (raw) => ({
      provider: "github",
      providerAccountId: String(raw.id),
      email: raw.email ?? null,
      name: raw.name ?? raw.login ?? null,
      image: raw.avatar_url ?? null,
    }),
  },
};

export function getCallbackBaseUrl(requestOrigin?: string): string {
  if (requestOrigin) return requestOrigin;
  return (
    process.env.OAUTH_CALLBACK_BASE_URL ??
    `http://localhost:${process.env.PORT ?? 3000}`
  );
}

export function getCallbackUrl(provider: OAuthProvider, baseUrl?: string): string {
  return `${getCallbackBaseUrl(baseUrl)}/api/auth/oauth/${provider}/callback`;
}

export function getProviderConfig(provider: string): ProviderConfig {
  const cfg = PROVIDERS[provider as OAuthProvider];
  if (!cfg) {
    throw new Error(`不支持的 OAuth 提供商: ${provider}`);
  }
  return cfg;
}

export function isProviderConfigured(provider: OAuthProvider): boolean {
  const cfg = PROVIDERS[provider];
  return Boolean(cfg.getClientId() && cfg.getClientSecret());
}

export function generateState(): string {
  const random = Math.random().toString(36).slice(2, 12);
  const ts = Date.now().toString(36);
  return `${ts}.${random}`;
}

/** 判断当前是否 HTTPS 环境（仅在显式 https 开头时视为 secure） */
export function isSecureContext(origin?: string): boolean {
  if (origin) return origin.startsWith("https://");
  return process.env.NODE_ENV === "production" && !process.env.OAUTH_INSECURE_COOKIE;
}

export function buildAuthorizeUrl(
  provider: OAuthProvider,
  state: string,
  baseUrl?: string
): string {
  const cfg = PROVIDERS[provider];
  const params = new URLSearchParams({
    client_id: cfg.getClientId(),
    redirect_uri: getCallbackUrl(provider, baseUrl),
    response_type: "code",
    scope: cfg.scope,
    state,
  });
  return `${cfg.authorizeUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  provider: OAuthProvider,
  code: string,
  baseUrl?: string
): Promise<string> {
  const cfg = PROVIDERS[provider];
  const body: Record<string, string> = {
    client_id: cfg.getClientId(),
    client_secret: cfg.getClientSecret(),
    code,
    redirect_uri: getCallbackUrl(provider, baseUrl),
    grant_type: "authorization_code",
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };
  const res = await fetch(cfg.tokenUrl, {
    method: "POST",
    headers,
    body: new URLSearchParams(body).toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`换取 token 失败 (HTTP ${res.status}): ${text}`);
  }

  const data = await res.json();
  const accessToken = data.access_token;
  if (!accessToken) {
    const errDesc = data.error_description || data.error || JSON.stringify(data);
    throw new Error(`GitHub 返回错误: ${errDesc}`);
  }
  return accessToken as string;
}

export async function fetchUserInfo(
  provider: OAuthProvider,
  accessToken: string
): Promise<OAuthUserInfo> {
  const cfg = PROVIDERS[provider];
  const res = await fetch(cfg.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...(provider === "github" ? { "User-Agent": "PromptHub" } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`获取用户信息失败 (HTTP ${res.status}): ${text}`);
  }

  const raw = await res.json();
  const info = cfg.parseUserInfo(raw);

  if (provider === "github" && !info.email) {
    const emailRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "User-Agent": "PromptHub",
      },
    });
    if (emailRes.ok) {
      const emails = await emailRes.json();
      const primary = (emails as any[])?.find((e) => e.primary && e.verified);
      if (primary?.email) {
        info.email = primary.email;
      }
    }
  }

  if (!info.email) {
    throw new Error(
      "GitHub 未返回邮箱地址。请在 GitHub 设置中公开邮箱，或在 Settings → Emails 中勾选 'Keep my email addresses private' 后使用 noreply 邮箱。"
    );
  }

  return info;
}
