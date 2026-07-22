"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TagSelector } from "@/components/common/TagSelector";
import { TagInput } from "@/components/common/TagInput";
import { CopyButton } from "@/components/common/CopyButton";
import { PromptEditor } from "@/components/prompts/PromptEditor";
import { LANGUAGES, ROLES, STAGES } from "@/types";
import { formatDate, extractVariables, highlightVariables } from "@/lib/utils";
import type { Prompt } from "@/types";

export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    description: "",
    language: [] as string[],
    role: [] as string[],
    stage: [] as string[],
    tags: [] as string[],
  });

  const fetchPrompt = useCallback(async () => {
    try {
      const res = await fetch(`/api/prompts/${id}`);
      if (!res.ok) {
        router.push("/prompts");
        return;
      }
      const data = await res.json();
      setPrompt(data);
      setEditForm({
        title: data.title,
        content: data.content,
        description: data.description ?? "",
        language: data.language,
        role: data.role,
        stage: data.stage,
        tags: data.tags,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchPrompt();
  }, [fetchPrompt]);

  const handleSave = async () => {
    if (!editForm.title || !editForm.content) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/prompts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditing(false);
        fetchPrompt();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!prompt) return;
    await fetch(`/api/prompts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !prompt.isFavorite }),
    });
    fetchPrompt();
  };

  const handleDelete = async () => {
    await fetch(`/api/prompts/${id}`, { method: "DELETE" });
    router.push("/prompts");
  };

  useEffect(() => {
    if (!editing) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (editForm.title && editForm.content && !saving) handleSave();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [editing, editForm.title, editForm.content, saving]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center min-h-[60vh]">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-[var(--border-default)]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent" style={{ borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
          <div className="absolute inset-1 rounded-full border-2 border-transparent" style={{ borderBottomColor: "var(--accent-hover)", animation: "spin 1.2s linear infinite reverse" }} />
        </div>
      </div>
    );
  }

  if (!prompt) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 page-enter">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/prompts"
          className="flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          返回列表
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleToggleFavorite}>
            {prompt.isFavorite ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
            )}
            {prompt.isFavorite ? "取消收藏" : "收藏"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            编辑
          </Button>
          <Button variant="ghost" size="sm" className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10" onClick={() => setShowDelete(true)}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            删除
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-black text-[var(--text-primary)] mb-2 flex items-center gap-2">
          {prompt.isFavorite && (
            <svg className="h-5 w-5 fill-[var(--accent)] text-[var(--accent)]" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
          )}
          {prompt.title}
        </h1>
        {prompt.description && (
          <p className="text-[var(--text-tertiary)]">{prompt.description}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {prompt.language.map((lang) => (
          <Badge key={lang} variant="accent" className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg> {lang}
          </Badge>
        ))}
        {prompt.role.map((role) => (
          <Badge key={role} variant="outline">{role}</Badge>
        ))}
        {prompt.stage.map((stage) => (
          <Badge key={stage} variant="subtle">
            <svg className="h-3 w-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg> {stage}
          </Badge>
        ))}
        {prompt.tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            <svg className="h-3 w-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg> {tag}
          </Badge>
        ))}
      </div>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">提示词内容</TabsTrigger>
          <TabsTrigger value="versions">版本历史 ({prompt.versions.length})</TabsTrigger>
          <TabsTrigger value="meta">元信息</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <div className="relative mt-4">
            <div className="absolute top-3 right-3 z-10">
              <CopyButton text={prompt.content} />
            </div>
            <pre
              className="w-full p-5 rounded-xl border text-sm leading-relaxed overflow-x-auto"
              style={{
                background: "var(--surface-card)",
                borderColor: "var(--border-default)",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                whiteSpace: "pre-wrap",
              }}
            >
              {prompt.content}
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="versions">
          <div className="mt-4 space-y-3">
            <div
              className="p-4 rounded-xl border"
              style={{
                background: "var(--surface-card)",
                borderColor: "var(--border-default)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge variant="default">当前版本</Badge>
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {formatDate(prompt.updatedAt)}
                </span>
              </div>
              <pre
                className="text-xs leading-relaxed"
                style={{
                  color: "var(--text-tertiary)",
                  fontFamily: "var(--font-mono, monospace)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {prompt.content.length > 300 ? prompt.content.slice(0, 300) + "..." : prompt.content}
              </pre>
            </div>
            {prompt.versions.length > 0 && prompt.versions.map((v, i) => {
              const versionNum = prompt.versions.length - i;
              return (
              <div
                key={i}
                className="p-4 rounded-xl border"
                style={{
                  background: "var(--surface-glass)",
                  borderColor: "var(--border-default)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[var(--text-muted)]">v{versionNum}</span>
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {formatDate(v.createdAt)}
                  </span>
                </div>
                <pre
                  className="text-xs leading-relaxed"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono, monospace)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {v.content.length > 300 ? v.content.slice(0, 300) + "..." : v.content}
                </pre>
              </div>
              );
            })}
            {prompt.versions.length === 0 && (
              <p className="text-sm text-[var(--text-muted)] text-center py-8">暂无版本历史</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="meta">
          <div className="mt-4 space-y-3">
            {[
              { label: "创建时间", value: formatDate(prompt.createdAt) },
              { label: "更新时间", value: formatDate(prompt.updatedAt) },
              { label: "提示词 ID", value: prompt.id, mono: true },
              { label: "内容字数", value: `${prompt.content.length} 字` },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between py-2.5"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
              >
                <span className="text-sm text-[var(--text-muted)]">{row.label}</span>
                {row.mono ? (
                  <code className="text-xs" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono, monospace)" }}>{row.value}</code>
                ) : (
                  <span className="text-sm text-[var(--text-secondary)]">{row.value}</span>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editing} onOpenChange={(v) => { setEditing(v); if (!v) setActiveTab("write"); }}>
        <DialogContent className="max-w-[860px]">
          {/* Accent top bar */}
          <div
            className="h-[3px] w-full rounded-b"
            style={{
              background: "linear-gradient(90deg, var(--accent) 0%, var(--accent-hover) 50%, var(--accent) 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s ease-in-out infinite",
            }}
          />

          {/* Header */}
          <DialogHeader className="px-7 pt-5 pb-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
                    boxShadow: "0 4px 14px var(--accent-glow)",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>
                <div>
                  <DialogTitle className="text-[1.05rem] font-bold">编辑提示词</DialogTitle>
                  <DialogDescription className="text-xs mt-0.5">
                    修改提示词内容和标签分类信息
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Body */}
          <div className="px-7 py-5 space-y-5 overflow-y-auto max-h-[60vh]">
            {/* Section 1: Basic Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "var(--accent-subtle)" }}>
                  <span className="text-[10px] font-black" style={{ color: "var(--accent)" }}>1</span>
                </div>
                <span className="text-xs font-bold tracking-wide uppercase" style={{ color: "var(--text-tertiary)" }}>基本信息</span>
              </div>
              <div className="space-y-3 pl-7">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                    标题 <span style={{ color: "#f87171" }}>*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M4 6h16M4 12h16M4 18h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="例如：TypeScript 代码审查提示词"
                      className="pl-9 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>描述</label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="简短描述这个提示词的用途..."
                    className="min-h-[60px] text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="pl-7">
              <div className="h-px" style={{ background: "var(--border-subtle)" }} />
            </div>

            {/* Section 2: Content */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "var(--accent-subtle)" }}>
                  <span className="text-[10px] font-black" style={{ color: "var(--accent)" }}>2</span>
                </div>
                <span className="text-xs font-bold tracking-wide uppercase" style={{ color: "var(--text-tertiary)" }}>内容编辑</span>
              </div>
              <div className="space-y-2 pl-7">
                <div className="flex items-center justify-between">
                  <div className="flex rounded-lg overflow-hidden border text-xs font-semibold" style={{ borderColor: "var(--border-default)" }}>
                    <button
                      onClick={() => setActiveTab("write")}
                      className="px-3 py-1.5 transition-all duration-150"
                      style={activeTab === "write" ? { background: "var(--accent-subtle)", color: "var(--accent)" } : { color: "var(--text-muted)" }}
                      onMouseEnter={(e) => activeTab !== "write" && (e.currentTarget.style.color = "var(--text-secondary)")}
                      onMouseLeave={(e) => activeTab !== "write" && (e.currentTarget.style.color = "var(--text-muted)")}
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => setActiveTab("preview")}
                      className="px-3 py-1.5 transition-all duration-150"
                      style={activeTab === "preview" ? { background: "var(--accent-subtle)", color: "var(--accent)" } : { color: "var(--text-muted)" }}
                      onMouseEnter={(e) => activeTab !== "preview" && (e.currentTarget.style.color = "var(--text-secondary)")}
                      onMouseLeave={(e) => activeTab !== "preview" && (e.currentTarget.style.color = "var(--text-muted)")}
                    >
                      预览
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {editForm.content && activeTab === "write" && (
                      <button
                        onClick={() => setEditForm({ ...editForm, content: "" })}
                        className="text-[11px] px-2 py-1 rounded-md transition-colors"
                        style={{ color: "var(--text-muted)", background: "transparent" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-muted)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                      >
                        清空
                      </button>
                    )}
                    <span className="text-[11px] tabular-nums" style={{ color: "var(--text-muted)" }}>
                      {editForm.content.length} 字符
                    </span>
                  </div>
                </div>

                {activeTab === "write" ? (
                  <div className="space-y-2">
                    <PromptEditor
                      value={editForm.content}
                      onChange={(v) => setEditForm({ ...editForm, content: v })}
                      placeholder={"输入提示词内容，可以使用 {{variable}} 作为变量占位符..."}
                    />
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      支持 {"{{variable}}"} 语法定义变量占位符
                    </p>
                  </div>
                ) : (
                  <div
                    className="rounded-xl border min-h-[160px] p-4 overflow-auto"
                    style={{
                      background: "var(--surface-glass)",
                      borderColor: "var(--border-default)",
                      fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                      fontSize: "0.8125rem",
                      lineHeight: "1.6",
                    }}
                    dangerouslySetInnerHTML={{ __html: highlightVariables(editForm.content || "<span style='color:var(--text-muted)'>预览区域...</span>") }}
                  />
                )}

                {activeTab === "write" && editForm.content && (() => {
                  const vars = extractVariables(editForm.content);
                  return vars.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl" style={{ background: "var(--accent-muted)", border: "1px solid var(--border-subtle)" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ color: "var(--accent)" }}>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <span className="text-[11px] font-semibold" style={{ color: "var(--accent)" }}>
                        {vars.length} 个变量
                      </span>
                      <div className="w-px h-3 mx-0.5" style={{ background: "var(--border-default)" }} />
                      {vars.map((v) => (
                        <span key={v} className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-mono font-semibold" style={{ background: "var(--accent-subtle)", color: "var(--accent-hover)" }}>
                          {"{{"}{v}{"}}" }
                        </span>
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>
            </div>

            {/* Divider */}
            <div className="pl-7">
              <div className="h-px" style={{ background: "var(--border-subtle)" }} />
            </div>

            {/* Section 3: Tags */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "var(--accent-subtle)" }}>
                  <span className="text-[10px] font-black" style={{ color: "var(--accent)" }}>3</span>
                </div>
                <span className="text-xs font-bold tracking-wide uppercase" style={{ color: "var(--text-tertiary)" }}>标签分类</span>
              </div>
              <div className="space-y-4 pl-7">
                <TagSelector label="语言标签" options={LANGUAGES} value={editForm.language} onChange={(v) => setEditForm({ ...editForm, language: v })} />
                <TagSelector label="角色标签" options={ROLES} value={editForm.role} onChange={(v) => setEditForm({ ...editForm, role: v })} />
                <TagSelector label="开发阶段" options={STAGES} value={editForm.stage} onChange={(v) => setEditForm({ ...editForm, stage: v })} />
                <TagInput
                  value={editForm.tags}
                  onChange={(v) => setEditForm({ ...editForm, tags: v })}
                  label="自定义标签"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter style={{ borderTop: "1px solid var(--border-subtle)", padding: "16px 24px", background: "var(--surface-glass)" }}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                <kbd className="px-1.5 py-0.5 rounded border text-[10px] font-mono" style={{ borderColor: "var(--border-default)", background: "var(--surface-elevated)" }}>
                  Ctrl
                </kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 rounded border text-[10px] font-mono" style={{ borderColor: "var(--border-default)", background: "var(--surface-elevated)" }}>
                  Enter
                </kbd>
                <span className="ml-1">快速保存</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                  取消
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!editForm.title || !editForm.content || saving}
                  size="sm"
                  className="min-w-[100px]"
                >
                  {saving ? (
                    <span className="flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                      </svg>
                      保存中...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      保存修改
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除提示词</DialogTitle>
            <DialogDescription>
              确定要删除「{prompt.title}」吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
