"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/common/CopyButton";
import { cn, highlightVariables, formatDate, extractVariables } from "@/lib/utils";

interface PublicPrompt {
  id: string;
  title: string;
  content: string;
  description: string | null;
  language: string[];
  role: string[];
  stage: string[];
  tags: string[];
  visibility: "SHARED";
  userId: string;
  user: {
    username: string;
    image: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export default function PublicPromptPage() {
  const params = useParams();
  const router = useRouter();
  const [prompt, setPrompt] = useState<PublicPrompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "preview">("content");

  useEffect(() => {
    async function fetchPrompt() {
      try {
        const res = await fetch(`/api/public/prompts/${params.id}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setPrompt(data);
        }
      } catch (e) {
        console.error(e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPrompt();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-[var(--border-default)]" />
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{
                borderTopColor: "var(--accent)",
                animation: "spin 0.8s linear infinite",
              }}
            />
          </div>
          <p className="text-sm text-[var(--text-tertiary)]">加载中...</p>
        </div>
      </div>
    );
  }

  if (notFound || !prompt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
            style={{
              background: "var(--accent-subtle)",
              border: "1px solid var(--border-default)",
            }}
          >
            <svg className="h-10 w-10 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-secondary)] mb-2">提示词不存在</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">该提示词可能已被删除或设置为私有</p>
          <Link href="/explore">
            <Button>
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              返回探索页
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const variables = extractVariables(prompt.content);

  return (
    <div className="min-h-screen page-enter">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-header" style={{ backdropFilter: "blur(20px)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/explore" className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                返回探索
              </Link>
            </div>
            <Link href="/login" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
              登录以管理提示词
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              公开提示词
            </span>
          </div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] mb-4">
            {prompt.title}
          </h1>
          
          {/* Author & Meta */}
          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
              >
                {prompt.user.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-[var(--text-secondary)]">{prompt.user.username}</span>
            </div>
            <span>·</span>
            <span>发布于 {formatDate(prompt.createdAt)}</span>
            <span>·</span>
            <span>更新于 {formatDate(prompt.updatedAt)}</span>
          </div>

          {/* Description */}
          {prompt.description && (
            <p className="mt-4 text-base text-[var(--text-tertiary)] leading-relaxed">
              {prompt.description}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {prompt.language.map((lang) => (
              <Badge key={lang} variant="accent" className="text-xs">
                {lang}
              </Badge>
            ))}
            {prompt.role.map((role) => (
              <Badge key={role} variant="outline" className="text-xs">
                {role}
              </Badge>
            ))}
            {prompt.stage.map((stage) => (
              <Badge key={stage} variant="subtle" className="text-xs">
                {stage}
              </Badge>
            ))}
            {prompt.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Content section */}
        <div className="rounded-2xl overflow-hidden" style={{ 
          background: "var(--surface-elevated)", 
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-md)"
        }}>
          {/* Tab bar */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--border-default)" }}>
              <button
                onClick={() => setActiveTab("content")}
                className="px-4 py-2 text-sm font-medium transition-all duration-150"
                style={activeTab === "content" 
                  ? { background: "var(--accent-subtle)", color: "var(--accent)" } 
                  : { color: "var(--text-muted)" }
                }
              >
                编辑内容
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className="px-4 py-2 text-sm font-medium transition-all duration-150"
                style={activeTab === "preview" 
                  ? { background: "var(--accent-subtle)", color: "var(--accent)" } 
                  : { color: "var(--text-muted)" }
                }
              >
                预览效果
              </button>
            </div>
            <CopyButton text={prompt.content} />
          </div>

          {/* Content area */}
          <div className="p-6">
            {activeTab === "content" ? (
              <div
                className="text-sm whitespace-pre-wrap leading-relaxed"
                style={{ 
                  fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                  color: "var(--text-secondary)",
                }}
              >
                {prompt.content}
              </div>
            ) : (
              <div
                className="text-sm leading-relaxed rounded-xl p-4"
                style={{ 
                  fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                  background: "var(--surface-glass)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)",
                }}
                dangerouslySetInnerHTML={{ __html: highlightVariables(prompt.content) }}
              />
            )}
          </div>

          {/* Variables section */}
          {variables.length > 0 && (
            <div 
              className="px-6 py-4"
              style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--surface-glass)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: "var(--accent)" }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-xs font-bold" style={{ color: "var(--text-tertiary)" }}>
                  可用变量
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {variables.map((v) => (
                  <span 
                    key={v} 
                    className="px-3 py-1.5 rounded-lg text-sm font-mono font-semibold"
                    style={{ 
                      background: "var(--accent-subtle)", 
                      color: "var(--accent)" 
                    }}
                  >
                    {"{{"}{v}{"}}" }
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats & Actions */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
              {prompt.content.length} 字符
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7"/>
              </svg>
              {variables.length} 个变量
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
              {prompt.tags.length + prompt.language.length + prompt.role.length + prompt.stage.length} 个标签
            </span>
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              创建类似提示词
            </Button>
          </Link>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl p-8 text-center" style={{ 
          background: "var(--accent-subtle)", 
          border: "1px solid var(--border-default)" 
        }}>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            想分享你的提示词吗？
          </h3>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            加入 PromptHub，与社区分享你的创意提示词
          </p>
          <Link href="/login">
            <Button size="lg">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              立即开始
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
