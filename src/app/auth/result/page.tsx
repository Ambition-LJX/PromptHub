"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, BookOpen } from "lucide-react";

const ERROR_MESSAGES: Record<string, { title: string; desc: string }> = {
  unsupported_provider: {
    title: "不支持的登录方式",
    desc: "该第三方登录方式暂不支持，请使用 GitHub 登录。",
  },
  provider_not_configured: {
    title: "第三方登录未配置",
    desc: "GitHub 登录尚未完成配置，请联系管理员设置 Client ID 和 Client Secret。",
  },
  missing_params: {
    title: "登录参数缺失",
    desc: "OAuth 回调缺少必要参数（code/state），请返回登录页重试。",
  },
  invalid_state: {
    title: "登录状态已过期",
    desc: "安全校验失败（state 不匹配），可能是登录会话过期或 CSRF 防护触发，请返回重新登录。",
  },
  state_cookie_missing: {
    title: "登录状态丢失",
    desc: "无法找到登录时保存的状态信息，请确认使用正确的地址（localhost:3000）访问应用，然后重新登录。",
  },
  oauth_denied: {
    title: "授权已取消",
    desc: "你取消了对 GitHub 的授权，登录未能完成。",
  },
  no_email: {
    title: "无法获取邮箱",
    desc: "GitHub 未返回邮箱地址。请在 GitHub Settings → Emails 中确保有一个已验证的主邮箱，或公开邮箱后重试。",
  },
  callback_failed: {
    title: "登录失败",
    desc: "与 GitHub 通信时发生错误，请稍后重试。",
  },
};

type ResultStatus = "success" | "error" | "loading";

export default function AuthResultPage() {
  const router = useRouter();
  const [status, setStatus] = useState<ResultStatus>("loading");
  const [title, setTitle] = useState("处理中...");
  const [desc, setDesc] = useState("正在验证登录信息...");
  const [detail, setDetail] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const statusParam = params.get("status") as ResultStatus;
    const errorCode = params.get("error");
    const detailParam = params.get("detail");
    const usernameParam = params.get("username");

    if (statusParam === "success") {
      setStatus("success");
      setTitle("登录成功！");
      setUsername(usernameParam || "");
      setDesc(
        usernameParam
          ? `欢迎回来，${usernameParam}！正在为你跳转到首页...`
          : "登录成功，正在为你跳转到首页..."
      );
    } else {
      setStatus("error");
      const errInfo = errorCode ? ERROR_MESSAGES[errorCode] : null;
      setTitle(errInfo?.title ?? "登录失败");
      let finalDesc = errInfo?.desc ?? "发生了未知错误，请稍后重试。";
      if (detailParam) {
        const decoded = decodeURIComponent(detailParam);
        if (errorCode === "callback_failed" || errorCode === "oauth_denied") {
          setDetail(decoded);
        }
      }
      setDesc(finalDesc);
    }
  }, []);

  useEffect(() => {
    if (status !== "success") return;
    if (countdown <= 0) {
      router.push("/");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, countdown, router]);

  const goHome = useCallback(() => router.push("/"), [router]);
  const goLogin = useCallback(() => router.push("/login"), [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 450,
            top: "-10%",
            right: "-5%",
            background:
              status === "success"
                ? "radial-gradient(ellipse, rgba(34,197,94,0.15), transparent 70%)"
                : "radial-gradient(ellipse, rgba(239,68,68,0.12), transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 400,
            bottom: "-10%",
            left: "-5%",
            background:
              status === "success"
                ? "radial-gradient(ellipse, rgba(59,130,246,0.12), transparent 70%)"
                : "radial-gradient(ellipse, rgba(168,85,247,0.10), transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      <div
        className="relative z-10 w-full max-w-md rounded-3xl p-10 text-center"
        style={{
          background: "var(--surface-elevated)",
          border: "1px solid var(--border-strong)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{
            background:
              status === "success"
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : status === "error"
                  ? "linear-gradient(135deg, #ef4444, #dc2626)"
                  : "linear-gradient(135deg, var(--accent), var(--accent-hover))",
          }}
        >
          {status === "loading" ? (
            <Loader2 className="h-7 w-7 text-white animate-spin" />
          ) : status === "success" ? (
            <CheckCircle className="h-7 w-7 text-white" />
          ) : (
            <XCircle className="h-7 w-7 text-white" />
          )}
        </div>

        <h1 className="text-2xl font-black mb-3" style={{ color: "var(--text-primary)" }}>
          {title}
        </h1>

        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
          {desc}
        </p>

        {detail && (
          <details className="mb-5 text-left">
            <summary
              className="text-xs cursor-pointer select-none mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              查看详细错误信息
            </summary>
            <div
              className="px-3 py-2 rounded-lg text-xs font-mono overflow-auto max-h-32"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-tertiary)",
              }}
            >
              {detail}
            </div>
          </details>
        )}

        {status === "success" && (
          <div className="mb-5">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              将在 <span className="font-bold" style={{ color: "var(--accent)" }}>{countdown}</span> 秒后自动跳转到首页...
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {status === "success" ? (
            <button
              onClick={goHome}
              className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
            >
              立即进入首页 ({countdown}s)
            </button>
          ) : (
            <>
              <button
                onClick={goLogin}
                className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
              >
                返回登录页
              </button>
              <button
                onClick={goHome}
                className="w-full h-11 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "var(--surface-glass)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)",
                }}
              >
                返回首页
              </button>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          <BookOpen className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            PromptHub
          </span>
        </div>
      </div>
    </div>
  );
}
