"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, BookOpen, Sparkles, Users, Palette, CheckCircle2, XCircle } from "lucide-react";

const strengthColors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];

function getPasswordStrength(password: string) {
  let score = 0;
  if (!password) return { score: 0, label: "", color: "" };
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["太短", "弱", "一般", "良好", "强", "非常强"];
  const color = strengthColors[Math.min(score - 1, 3)] || strengthColors[0];
  return { score, label: labels[score - 1] || "", color };
}

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
        minLength={6}
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

const passwordRequirements = [
  { label: "至少 6 个字符", test: (p: string) => p.length >= 6 },
  { label: "包含数字", test: (p: string) => /[0-9]/.test(p) },
  { label: "包含大写字母", test: (p: string) => /[A-Z]/.test(p) },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    if (form.password.length < 6) {
      setError("密码长度至少为 6 个字符");
      return;
    }

    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      setSuccess(true);
      setTimeout(() => router.push("/"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败，请重试");
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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute"
          style={{
            width: 700,
            height: 500,
            top: "-10%",
            left: "-5%",
            background: "radial-gradient(ellipse, rgba(99,102,241,0.18), transparent 70%)",
            filter: "blur(40px)",
            animation: "floatA 12s ease-in-out infinite",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 600,
            height: 450,
            top: "40%",
            right: "-8%",
            background: "radial-gradient(ellipse, rgba(168,85,247,0.14), transparent 70%)",
            filter: "blur(40px)",
            animation: "floatB 15s ease-in-out infinite",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 500,
            height: 400,
            bottom: "-5%",
            left: "30%",
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
            <span className="gradient-text">开启创意之旅</span>
          </h2>
          <p className="text-base leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
            加入 PromptHub，与全球创作者一起探索 AI 提示词的无限可能
          </p>
          <div className="space-y-4">
            {[
              { icon: Sparkles, text: "探索精选提示词库" },
              { icon: Palette, text: "创建专属提示词作品" },
              { icon: Users, text: "与团队高效协作" },
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
              <span className="gradient-text">创建账号</span>
            </h1>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              已有账号？{" "}
              <Link href="/login" className="font-semibold transition-colors hover:opacity-80" style={{ color: "var(--accent)" }}>
                立即登录
              </Link>
            </p>
          </div>

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2.5"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 7v6M12 17h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2.5"
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
                color: "#4ade80",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              注册成功，正在跳转...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                用户名
              </label>
              <div className="relative">
                <span
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--text-muted)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <Input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="yourname"
                  className="pl-10"
                  required
                />
              </div>
            </div>

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
                placeholder="Create a strong password"
              />
              {form.password && (
                <div className="mt-3">
                  <div className="flex gap-1.5 mb-2">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className="h-1.5 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: level <= strength.score ? strength.color : "var(--border-default)",
                          opacity: level <= strength.score ? 1 : 0.4,
                        }}
                      />
                    ))}
                  </div>
                  <div className="space-y-1">
                    {passwordRequirements.map((req, i) => {
                      const met = req.test(form.password);
                      return (
                        <div key={i} className="flex items-center gap-2">
                          {met ? (
                            <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#22c55e" }} />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                          )}
                          <span className="text-xs" style={{ color: met ? "#86efac" : "var(--text-muted)" }}>
                            {req.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                确认密码
              </label>
              <div className="relative">
                <span
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--text-muted)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                  </svg>
                </span>
                <Input
                  type={form.confirmPassword ? (form.password === form.confirmPassword ? "text" : "password") : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Repeat your password"
                  className="pl-10"
                  required
                  minLength={6}
                />
                {form.confirmPassword && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {form.password === form.confirmPassword ? (
                      <CheckCircle2 className="h-4 w-4" style={{ color: "#22c55e" }} />
                    ) : (
                      <XCircle className="h-4 w-4" style={{ color: "#f87171" }} />
                    )}
                  </span>
                )}
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#f87171" }}>
                  <XCircle className="h-3 w-3" /> 两次输入的密码不一致
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-1"
              size="lg"
              disabled={loading || success}
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
                  注册中...
                </span>
              ) : success ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  注册成功
                </span>
              ) : (
                "创建账号"
              )}
            </Button>
          </form>

          {/* Terms */}
          <p className="mt-5 text-center text-xs" style={{ color: "var(--text-muted)" }}>
            注册即表示同意{" "}
            <Link href="/terms" className="font-medium underline-offset-2 hover:underline" style={{ color: "var(--text-tertiary)" }}>
              服务条款
            </Link>{" "}
            和{" "}
            <Link href="/privacy" className="font-medium underline-offset-2 hover:underline" style={{ color: "var(--text-tertiary)" }}>
              隐私政策
            </Link>
          </p>
        </div>
      </div>

      <style>{`
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
