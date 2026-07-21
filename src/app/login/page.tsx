"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, BookOpen, Layers, Sparkles } from "lucide-react";

// OAuth 错误码 → 友好提示
const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  unsupported_provider: "不支持的登录方式",
  provider_not_configured: "该第三方登录尚未配置，请联系管理员",
  missing_params: "登录参数缺失，请重试",
  invalid_state: "登录状态已过期，请重试",
  state_cookie_missing: "登录状态丢失，请使用 localhost:3000 访问并重新登录",
  oauth_denied: "你取消了 GitHub 授权",
  no_email: "无法获取 GitHub 邮箱，请确保 GitHub 账号有已验证的主邮箱",
  callback_failed: "第三方登录失败，请重试",
};

function PasswordInput({
  value,
  onChange,
  placeholder,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <span
        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "var(--text-muted)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-10 pr-10"
        required
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  // 读取 URL 上的 OAuth 错误参数（如 /login?error=invalid_state）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errCode = params.get("error");
    const errDetail = params.get("detail");
    if (errCode) {
      let msg = OAUTH_ERROR_MESSAGES[errCode] ?? "登录失败，请重试";
      if (errDetail) {
        msg += `\n\n详情：${decodeURIComponent(errDetail)}`;
      }
      setError(msg);
    }
  }, []);

  // 跳转到 OAuth 发起路由
  const handleOAuthLogin = (provider: "github") => {
    setError("");
    setOauthLoading(provider);
    // 整页跳转到后端，由后端重定向到 provider 授权页
    window.location.href = `/api/auth/oauth/${provider}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败，请检查邮箱和密码");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Decorative animated orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 500,
            top: "-10%",
            right: "-5%",
            background: "radial-gradient(ellipse, rgba(99,102,241,0.18), transparent 70%)",
            filter: "blur(40px)",
            animation: "floatB 12s ease-in-out infinite",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 600,
            height: 450,
            bottom: "30%",
            left: "-8%",
            background: "radial-gradient(ellipse, rgba(168,85,247,0.14), transparent 70%)",
            filter: "blur(40px)",
            animation: "floatA 15s ease-in-out infinite",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 500,
            height: 400,
            bottom: "-5%",
            right: "25%",
            background: "radial-gradient(ellipse, rgba(59,130,246,0.12), transparent 70%)",
            filter: "blur(40px)",
            animation: "floatC 18s ease-in-out infinite",
          }}
        />
      </div>

      {/* Main card */}
      <div
        className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row rounded-3xl overflow-hidden"
        style={{
          background: "var(--surface-elevated)",
          border: "1px solid var(--border-strong)",
          boxShadow: "var(--shadow-lg), 0 0 80px rgba(99,102,241,0.08)",
        }}
      >
        {/* Left branding panel */}
        <div
          className="hidden md:flex flex-col justify-center px-10 py-14"
          style={{
            width: "45%",
            background: "linear-gradient(160deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.06) 100%)",
            borderRight: "1px solid var(--border-subtle)",
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
          >
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-3xl font-black mb-4" style={{ color: "var(--text-primary)" }}>
            <span className="gradient-text">欢迎回来</span>
          </h2>
          <p className="text-base leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
            继续探索 PromptHub 的无限创意潜能，与全球创作者一起成长
          </p>
          <div className="space-y-4">
            {[
              { icon: Sparkles, text: "管理你的提示词资产" },
              { icon: Layers, text: "协作共享团队成果" },
              { icon: BookOpen, text: "追踪项目进度" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span style={{ color: "var(--accent)" }}>
                  <item.icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 px-8 py-12 md:px-12">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
            >
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-black text-lg gradient-text">PromptHub</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-black mb-1" style={{ color: "var(--text-primary)" }}>
              <span className="gradient-text">登录账号</span>
            </h1>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              还没有账号？{" "}
              <Link href="/register" className="font-semibold transition-colors hover:opacity-80" style={{ color: "var(--accent)" }}>
                立即注册
              </Link>
            </p>
          </div>

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm flex items-start gap-2.5"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 7v6M12 17h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                邮箱
              </label>
              <div className="relative">
                <span
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--text-muted)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                密码
              </label>
              <PasswordInput
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
              />
            </div>

            <div className="flex justify-end -mt-1">
              <Link
                href="/forgot-password"
                className="text-xs font-medium transition-colors hover:underline"
                style={{ color: "var(--text-tertiary)" }}
              >
                忘记密码？
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full mt-1"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                  </svg>
                  登录中...
                </span>
              ) : (
                "登录"
              )}
            </Button>
          </form>

          {/* Divider with social label */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
            <span className="text-xs px-2 select-none" style={{ color: "var(--text-muted)" }}>
              继续使用
            </span>
            <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
          </div>

          {/* Social login buttons */}
          <div className="mt-5 grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() => handleOAuthLogin("github")}
              disabled={oauthLoading !== null}
              className="social-btn flex items-center justify-center gap-2.5 rounded-xl h-11 text-sm font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {oauthLoading === "github" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              )}
              GitHub
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .social-btn {
          background: var(--surface-glass);
          border: 1px solid var(--border-default);
          color: var(--text-secondary);
        }
        .social-btn:hover {
          background: var(--accent-subtle);
          border-color: var(--border-strong);
          color: var(--text-primary);
          transform: translateY(-1px);
        }
        .social-btn:active {
          transform: translateY(0);
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes floatA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.08); }
        }
        @keyframes floatB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 40px) scale(1.05); }
        }
        @keyframes floatC {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
