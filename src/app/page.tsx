"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PromptCard } from "@/components/prompts/PromptCard";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterPanel } from "@/components/common/FilterPanel";
import { TagSelector } from "@/components/common/TagSelector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LANGUAGES, ROLES, STAGES } from "@/types";
import { cn, extractVariables, highlightVariables } from "@/lib/utils";
import type { Prompt } from "@/types";

const DEFAULT_PAGE_SIZE = 20;

export default function HomePage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const searchParams = useSearchParams();
  const [isFavoriteOnly, setIsFavoriteOnly] = useState(() => searchParams.get("favorites") === "true");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    content: "",
    description: "",
    language: [] as string[],
    role: [] as string[],
    stage: [] as string[],
  });
  const [creating, setCreating] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const totalPages = Math.ceil(total / pageSize);

  const searchRef = useRef("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchRef.current);
      setPage(1);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (selectedLanguage) params.set("language", selectedLanguage);
      if (selectedRole) params.set("role", selectedRole);
      if (selectedStage) params.set("stage", selectedStage);
      if (selectedTag) params.set("tag", selectedTag);
      if (isFavoriteOnly) params.set("isFavorite", "true");
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      const res = await fetch(`/api/prompts?${params.toString()}`);
      const data = await res.json();
      if (data.prompts) {
        setPrompts(data.prompts);
        setTotal(data.total);
      } else if (Array.isArray(data)) {
        setPrompts(data);
        setTotal(data.length);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedLanguage, selectedRole, selectedStage, selectedTag, isFavoriteOnly, page, pageSize]);

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch("/api/prompts/tags");
      if (!res.ok) return;
      const tags = await res.json();
      if (Array.isArray(tags)) setAllTags(tags);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleToggleFavorite = useCallback(async (id: string, favorite: boolean) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: favorite } : p))
    );
    await fetch(`/api/prompts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: favorite }),
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个提示词吗？")) return;
    await fetch(`/api/prompts/${id}`, { method: "DELETE" });
    fetchPrompts();
    fetchTags();
  };

  const handleCreate = async () => {
    if (!createForm.title || !createForm.content) return;
    setCreating(true);
    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      if (res.ok) {
        setShowCreate(false);
        setCreateForm({ title: "", content: "", description: "", language: [], role: [], stage: [] });
        setPage(1);
        fetchPrompts();
        fetchTags();
      }
    } finally {
      setCreating(false);
    }
  };

  const clearFilters = () => {
    setSelectedLanguage("");
    setSelectedRole("");
    setSelectedStage("");
    setSelectedTag("");
    setIsFavoriteOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 page-enter">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">
            <span className="gradient-text">提示词库</span>
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
            {loading ? "加载中..." : `共 ${total} 个提示词`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div
            className="flex rounded-xl overflow-hidden border"
            style={{ borderColor: "var(--border-default)" }}
          >
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2.5 transition-all duration-200",
                viewMode === "grid"
                  ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-glass)]"
              )}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2.5 transition-all duration-200",
                viewMode === "list"
                  ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-glass)]"
              )}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            新建提示词
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div
            className="sticky top-20 glass-sidebar rounded-2xl p-4"
            style={{ backdropFilter: "blur(20px)" }}
          >
            <FilterPanel
              selectedLanguage={selectedLanguage}
              selectedRole={selectedRole}
              selectedStage={selectedStage}
              selectedTag={selectedTag}
              onLanguageChange={(v) => { setSelectedLanguage(v); setPage(1); }}
              onRoleChange={(v) => { setSelectedRole(v); setPage(1); }}
              onStageChange={(v) => { setSelectedStage(v); setPage(1); }}
              onTagChange={(v) => { setSelectedTag(v); setPage(1); }}
              allTags={allTags}
              isFavoriteOnly={isFavoriteOnly}
              onFavoriteChange={(v) => { setIsFavoriteOnly(v); setPage(1); }}
              onClear={clearFilters}
            />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search bar */}
          <div className="mb-5">
            <SearchBar
              value={search}
              onChange={(v) => { searchRef.current = v; setSearch(v); }}
              placeholder="搜索提示词标题、内容、标签..."
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                {/* Premium spinner */}
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--border-default)]" />
                  <div
                    className="absolute inset-0 rounded-full border-2 border-transparent"
                    style={{
                      borderTopColor: "var(--accent)",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  <div
                    className="absolute inset-1 rounded-full border-2 border-transparent"
                    style={{
                      borderBottomColor: "var(--accent-hover)",
                      animation: "spin 1.2s linear infinite reverse",
                    }}
                  />
                </div>
                <p className="text-sm text-[var(--text-tertiary)]">加载中...</p>
              </div>
            </div>
          ) : prompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
              <div
                className="h-20 w-20 rounded-3xl flex items-center justify-center mb-5"
                style={{
                  background: "var(--accent-subtle)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <svg className="h-9 w-9" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-secondary)] mb-1">
                {search || selectedLanguage || selectedRole || selectedStage || selectedTag
                  ? "没有找到匹配的提示词"
                  : "还没有提示词"}
              </h3>
              <p className="text-sm text-[var(--text-muted)] mb-5">
                {search || selectedLanguage || selectedRole || selectedStage || selectedTag
                  ? "试试调整搜索条件"
                  : "开始创建你的第一个提示词吧"}
              </p>
              {!search && !selectedLanguage && !selectedRole && !selectedStage && !selectedTag && (
                <Button onClick={() => setShowCreate(true)}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                  创建提示词
                </Button>
              )}
            </div>
          ) : (
            <>
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                    : "space-y-3"
                )}
              >
                {prompts.map((prompt, index) => (
                  <div
                    key={prompt.id}
                    style={{ animationDelay: `${index * 0.03}s` }}
                    className={cn(
                      "opacity-0 animate-fade-in",
                      `stagger-${Math.min(index + 1, 8)}`
                    )}
                  >
                    <PromptCard
                      prompt={prompt}
                      onToggleFavorite={handleToggleFavorite}
                      onDelete={handleDelete}
                      compact={viewMode === "list"}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    上一页
                  </Button>
                  <span className="text-sm text-[var(--text-tertiary)] px-2">
                    第 <span className="font-semibold text-[var(--text-secondary)]">{page}</span> / {totalPages} 页，共 {total} 个
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <CreateDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        createForm={createForm}
        setCreateForm={setCreateForm}
        onCreate={handleCreate}
        creating={creating}
      />
    </div>
  );
}

type CreateDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  createForm: {
    title: string;
    content: string;
    description: string;
    language: string[];
    role: string[];
    stage: string[];
  };
  setCreateForm: React.Dispatch<React.SetStateAction<{
    title: string;
    content: string;
    description: string;
    language: string[];
    role: string[];
    stage: string[];
  }>>;
  onCreate: () => void;
  creating: boolean;
};

function CreateDialog({ open, onOpenChange, createForm, setCreateForm, onCreate, creating }: CreateDialogProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const canSubmit = createForm.title.trim() && createForm.content.trim();
  const variables = extractVariables(createForm.content);

  useEffect(() => {
    if (!open) {
      setActiveTab("write");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onCreate();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCreate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9" />
                  <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                  <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                </svg>
              </div>
              <div>
                <DialogTitle className="text-[1.05rem] font-bold">新建提示词</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  创建一个新的 AI 提示词，支持多维度标签分类
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
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    placeholder="例如：TypeScript 代码审查提示词"
                    className="pl-9 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>描述</label>
                <Textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
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
                  {createForm.content && activeTab === "write" && (
                    <button
                      onClick={() => setCreateForm({ ...createForm, content: "" })}
                      className="text-[11px] px-2 py-1 rounded-md transition-colors"
                      style={{ color: "var(--text-muted)", background: "transparent" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-muted)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                    >
                      清空
                    </button>
                  )}
                  <span className="text-[11px] tabular-nums" style={{ color: "var(--text-muted)" }}>
                    {createForm.content.length} 字符
                  </span>
                </div>
              </div>

              {activeTab === "write" ? (
                <div className="space-y-2">
                  <Textarea
                    value={createForm.content}
                    onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                    placeholder={"输入提示词内容，可以使用 {{variable}} 作为变量占位符..."}
                    className="min-h-[160px] text-sm"
                    style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: "0.8125rem", resize: "vertical", lineHeight: "1.6" }}
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
                  dangerouslySetInnerHTML={{ __html: highlightVariables(createForm.content || "<span style='color:var(--text-muted)'>预览区域...</span>") }}
                />
              )}

              {activeTab === "write" && variables.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl" style={{ background: "var(--accent-muted)", border: "1px solid var(--border-subtle)" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ color: "var(--accent)" }}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="text-[11px] font-semibold" style={{ color: "var(--accent)" }}>
                    {variables.length} 个变量
                  </span>
                  <div className="w-px h-3 mx-0.5" style={{ background: "var(--border-default)" }} />
                  {variables.map((v) => (
                    <span key={v} className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-mono font-semibold" style={{ background: "var(--accent-subtle)", color: "var(--accent-hover)" }}>
                      {"{{"}{v}{"}}" }
                    </span>
                  ))}
                </div>
              )}
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
              <TagSelector label="语言标签" options={LANGUAGES} value={createForm.language} onChange={(v) => setCreateForm({ ...createForm, language: v })} />
              <TagSelector label="角色标签" options={ROLES} value={createForm.role} onChange={(v) => setCreateForm({ ...createForm, role: v })} />
              <TagSelector label="开发阶段" options={STAGES} value={createForm.stage} onChange={(v) => setCreateForm({ ...createForm, stage: v })} />
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
              <span className="ml-1">快速创建</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button
                onClick={onCreate}
                disabled={!canSubmit || creating}
                size="sm"
                className="min-w-[110px]"
              >
                {creating ? (
                  <span className="flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                    </svg>
                    创建中...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    创建提示词
                  </span>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
