"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PromptCard } from "@/components/prompts/PromptCard";
import { SearchBar } from "@/components/common/SearchBar";
import { Badge } from "@/components/ui/badge";
import { LANGUAGES, ROLES, STAGES } from "@/types";
import { cn } from "@/lib/utils";
import type { Prompt } from "@/types";
import {
  Heart,
  Sparkles,
  Copy,
  Download,
  LayoutGrid,
  LayoutList,
  X,
  Star,
} from "lucide-react";

const PAGE_SIZE = 20;

export default function FavoritesPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("isFavorite", "true");
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (selectedLanguage) params.set("language", selectedLanguage);
      if (selectedRole) params.set("role", selectedRole);
      if (selectedStage) params.set("stage", selectedStage);
      params.set("page", String(page));
      params.set("pageSize", String(PAGE_SIZE));

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
  }, [debouncedSearch, selectedLanguage, selectedRole, selectedStage, page]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleToggleFavorite = useCallback(async (id: string, favorite: boolean) => {
    setPrompts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, isFavorite: favorite } : p));
      return updated.filter((p) => p.isFavorite);
    });
    await fetch(`/api/prompts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: favorite }),
    });
    setTotal((t) => Math.max(0, t - 1));
    setSelectedIds((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个提示词吗？")) return;
    await fetch(`/api/prompts/${id}`, { method: "DELETE" });
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    setTotal((t) => Math.max(0, t - 1));
    setSelectedIds((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedLanguage("");
    setSelectedRole("");
    setSelectedStage("");
    setSearch("");
    setDebouncedSearch("");
  };

  const copyAllContents = () => {
    const texts = selectedIds.size > 0
      ? prompts.filter((p) => selectedIds.has(p.id)).map((p) => `# ${p.title}\n${p.content}`).join("\n\n")
      : prompts.map((p) => `# ${p.title}\n${p.content}`).join("\n\n");
    navigator.clipboard.writeText(texts);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportSelected = () => {
    const items = selectedIds.size > 0
      ? prompts.filter((p) => selectedIds.has(p.id))
      : prompts;
    const json = JSON.stringify(items, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompthub-favorites-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBulkMenuOpen(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === prompts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(prompts.map((p) => p.id)));
    }
  };

  const hasActiveFilters = selectedLanguage || selectedRole || selectedStage || search;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 page-enter">
      {/* ─── Hero Section ─── */}
      <div className="relative mb-8 overflow-hidden rounded-3xl">
        {/* Background decorative layer */}
        <div className="absolute inset-0 fav-hero-bg" />
        <div className="absolute inset-0 fav-hero-grid" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="fav-particle"
              style={{
                left: `${(i * 9 + 3) % 100}%`,
                top: `${(i * 17 + 7) % 100}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${3 + (i % 3)}s`,
              }}
            >
              <Star className="text-pink-400/60" style={{ fill: "currentColor" }} />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {/* Left: title & description */}
            <div className="flex items-start gap-4">
              <div className="fav-icon-wrapper flex-shrink-0">
                <Heart className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
                  我的收藏
                </h1>
                <p className="text-sm text-white/60 font-medium">
                  精心收藏的提示词，随时复用
                </p>
              </div>
            </div>

            {/* Right: stats */}
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="fav-stat-card">
                <span className="fav-stat-value">{loading ? "—" : total}</span>
                <span className="fav-stat-label">收藏总数</span>
              </div>
              <div className="fav-stat-card">
                <span className="fav-stat-value">
                  {loading ? "—" : [...new Set(prompts.flatMap((p) => p.language))].length}
                </span>
                <span className="fav-stat-label">涉及语言</span>
              </div>
              <div className="fav-stat-card hidden sm:block">
                <span className="fav-stat-value">
                  {loading ? "—" : [...new Set(prompts.flatMap((p) => p.role))].length}
                </span>
                <span className="fav-stat-label">涉及角色</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Action Toolbar ─── */}
      <div className="fav-toolbar mb-5">
        <div className="fav-toolbar-left">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="在收藏中搜索..."
          />
        </div>

        <div className="fav-toolbar-right">
          {/* Select all */}
          {prompts.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className={cn(
                "fav-tool-btn",
                selectedIds.size === prompts.length && prompts.length > 0 && "fav-tool-btn-active"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                  selectedIds.size === prompts.length && prompts.length > 0
                    ? "border-pink-400 bg-pink-400"
                    : "border-white/30"
                )}
              >
                {selectedIds.size === prompts.length && prompts.length > 0 && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="hidden sm:inline">全选</span>
            </button>
          )}

          {/* View mode */}
          <div className="fav-view-toggle">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("fav-view-btn", viewMode === "grid" && "active")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("fav-view-btn", viewMode === "list" && "active")}
            >
              <LayoutList className="h-4 w-4" />
            </button>
          </div>

          {/* Bulk actions */}
          {prompts.length > 0 && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkMenuOpen(!bulkMenuOpen)}
                className="fav-bulk-btn"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">批量操作</span>
                <span className="sm:hidden">{selectedIds.size > 0 ? `(${selectedIds.size})` : ""}</span>
              </Button>

              {bulkMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setBulkMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 fav-bulk-menu z-50">
                    <button
                      onClick={copyAllContents}
                      className="fav-bulk-item"
                    >
                      <Copy className="h-4 w-4" />
                      <span>{copied ? "已复制!" : "复制内容"}</span>
                    </button>
                    <button onClick={exportSelected} className="fav-bulk-item">
                      <Download className="h-4 w-4" />
                      <span>导出为 JSON</span>
                    </button>
                    <div className="h-px mx-3 my-1.5" style={{ background: "var(--border-subtle)" }} />
                    <button
                      onClick={() => {
                        prompts.filter((p) => selectedIds.has(p.id) || selectedIds.size === 0).forEach((p) => {
                          if (selectedIds.size === 0 || selectedIds.has(p.id)) {
                            handleToggleFavorite(p.id, false);
                          }
                        });
                        setBulkMenuOpen(false);
                      }}
                      className="fav-bulk-item text-red-400 hover:text-red-300"
                    >
                      <Heart className="h-4 w-4" style={{ fill: "none" }} />
                      <span>取消收藏</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Main Content Area ─── */}
      <div className="flex gap-6">
        {/* Sidebar: Category Filters */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-20 fav-sidebar rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                筛选
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-pink-400 hover:text-pink-300 transition-colors font-medium"
                >
                  重置
                </button>
              )}
            </div>

            <FilterChips
              title="语言"
              options={LANGUAGES}
              selected={selectedLanguage}
              onChange={(v) => { setSelectedLanguage(v); setPage(1); }}
            />
            <FilterChips
              title="角色"
              options={ROLES}
              selected={selectedRole}
              onChange={(v) => { setSelectedRole(v); setPage(1); }}
            />
            <FilterChips
              title="阶段"
              options={STAGES}
              selected={selectedStage}
              onChange={(v) => { setSelectedStage(v); setPage(1); }}
            />
          </div>
        </aside>

        {/* Content Grid/List */}
        <div className="flex-1 min-w-0">
          {/* Active filter chips display */}
          {hasActiveFilters && (
            <div className="fav-active-filters mb-4">
              {selectedLanguage && (
                <Badge variant="accent" className="text-xs">
                  {selectedLanguage}
                  <button onClick={() => { setSelectedLanguage(""); setPage(1); }} className="ml-1 hover:text-red-300">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedRole && (
                <Badge variant="accent" className="text-xs">
                  {selectedRole}
                  <button onClick={() => { setSelectedRole(""); setPage(1); }} className="ml-1 hover:text-red-300">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedStage && (
                <Badge variant="accent" className="text-xs">
                  {selectedStage}
                  <button onClick={() => { setSelectedStage(""); setPage(1); }} className="ml-1 hover:text-red-300">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {search && (
                <Badge variant="secondary" className="text-xs">
                  &ldquo;{search}&rdquo;
                  <button onClick={() => setSearch("")} className="ml-1 hover:text-red-300">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Selected count bar */}
          {selectedIds.size > 0 && (
            <div className="fav-selection-bar mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                <span className="text-sm font-semibold text-white">
                  已选择 {selectedIds.size} 个收藏
                </span>
              </div>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-white/50 hover:text-white transition-colors"
              >
                取消选择
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-pink-500/20" />
                  <div
                    className="absolute inset-0 rounded-full border-2 border-transparent"
                    style={{
                      borderTopColor: "#ec4899",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  <div
                    className="absolute inset-1 rounded-full border-2 border-transparent"
                    style={{
                      borderBottomColor: "#f472b6",
                      animation: "spin 1.2s linear infinite reverse",
                    }}
                  />
                  <div
                    className="absolute inset-2 rounded-full border-2 border-transparent"
                    style={{
                      borderRightColor: "#fb7185",
                      animation: "spin 1.6s linear infinite",
                    }}
                  />
                </div>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  加载你的收藏中...
                </p>
              </div>
            </div>
          ) : prompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center animate-fade-in">
              {/* Empty state illustration */}
              <div className="relative mb-6">
                <div className="fav-empty-orb" />
                <div className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center">
                  <Heart className="h-12 w-12 text-pink-400/80" />
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-secondary)" }}>
                {search || hasActiveFilters
                  ? "没有找到匹配的收藏"
                  : "还没有收藏任何提示词"}
              </h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)", maxWidth: "320px" }}>
                {search || hasActiveFilters
                  ? "试试调整筛选条件，或者清除搜索关键词"
                  : "在提示词库中浏览，找到喜欢的提示词后点击心形图标来收藏"}
              </p>
              {search || hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: "var(--accent-subtle)",
                    color: "var(--accent)",
                    border: "1px solid var(--border-default)",
                  }}
                >
                  清除筛选
                </button>
              ) : (
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #ec4899, #a855f7)",
                    boxShadow: "0 4px 20px rgba(236, 72, 153, 0.35)",
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                  去提示词库看看
                </a>
              )}
            </div>
          ) : (
            <>
              {/* Results header */}
              <div className="fav-results-header mb-4">
                <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  {search ? (
                    <>找到 <strong style={{ color: "var(--text-secondary)" }}>{total}</strong> 个与 &ldquo;{search}&rdquo; 相关的收藏</>
                  ) : hasActiveFilters ? (
                    <>显示 <strong style={{ color: "var(--text-secondary)" }}>{total}</strong> 个收藏</>
                  ) : (
                    <>共 <strong style={{ color: "var(--text-secondary)" }}>{total}</strong> 个收藏</>
                  )}
                </span>
              </div>

              {/* Grid / List */}
              <div
                className={cn(
                  viewMode === "grid"
                    ? "fav-grid"
                    : "space-y-3"
                )}
              >
                {prompts.map((prompt, index) => (
                  <div
                    key={prompt.id}
                    className={cn(
                      "opacity-0 animate-fade-in",
                      viewMode === "grid" && `fav-card-stagger stagger-${Math.min(index + 1, 8)}`
                    )}
                  >
                    {/* Selection checkbox overlay */}
                    <div className="relative">
                      <div
                        className={cn(
                          "fav-card-select",
                          selectedIds.has(prompt.id) && "fav-card-selected"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(prompt.id);
                        }}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                            selectedIds.has(prompt.id)
                              ? "border-pink-400 bg-pink-400 scale-110"
                              : "border-white/30 hover:border-white/60"
                          )}
                        >
                          {selectedIds.has(prompt.id) && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>

                      <PromptCard
                        prompt={prompt}
                        onToggleFavorite={handleToggleFavorite}
                        onDelete={handleDelete}
                        compact={viewMode === "list"}
                      />
                    </div>
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
                  <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                    第 <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>{page}</span> / {totalPages} 页，共 {total} 个
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
    </div>
  );
}

function FilterChips({
  title,
  options,
  selected,
  onChange,
}: {
  title: string;
  options: string[];
  selected: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          {title}
        </span>
        {selected && (
          <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
        )}
      </div>
      <div className="space-y-0.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(selected === opt ? "" : opt)}
            className={cn(
              "w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-all duration-150",
              selected === opt
                ? "bg-pink-500/20 text-pink-400 font-semibold"
                : "text-[var(--text-secondary)] hover:bg-pink-500/10 hover:text-[var(--text-primary)]"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
