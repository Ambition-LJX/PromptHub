"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PublicPromptCard } from "@/components/prompts/PublicPromptCard";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterPanel } from "@/components/common/FilterPanel";
import { LANGUAGES, ROLES, STAGES } from "@/types";
import { cn } from "@/lib/utils";

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

const DEFAULT_PAGE_SIZE = 20;

export default function ExplorePage() {
  const [prompts, setPrompts] = useState<PublicPrompt[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      const res = await fetch(`/api/public/prompts?${params.toString()}`);
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
  }, [debouncedSearch, selectedLanguage, selectedRole, selectedStage, selectedTag, page, pageSize]);

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch("/api/public/prompts");
      if (!res.ok) return;
      const data = await res.json();
      if (data.prompts) {
        const tagSet = new Set<string>();
        data.prompts.forEach((p: PublicPrompt) => {
          p.tags.forEach((t) => tagSet.add(t));
        });
        setAllTags(Array.from(tagSet).sort());
      }
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

  const clearFilters = () => {
    setSelectedLanguage("");
    setSelectedRole("");
    setSelectedStage("");
    setSelectedTag("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 page-enter">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" 
          style={{ background: "var(--accent-subtle)", border: "1px solid var(--border-default)" }}>
          <svg className="h-4 w-4" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            发现精彩提示词
          </span>
        </div>
        <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">
          <span className="gradient-text">探索社区</span>
        </h1>
        <p className="text-sm text-[var(--text-tertiary)]">
          {loading ? "加载中..." : `共 ${total} 个公开提示词`}
        </p>
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
              isFavoriteOnly={false}
              onFavoriteChange={() => {}}
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
              placeholder="搜索公开提示词..."
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--text-tertiary)]">
                按更新时间排序
              </span>
            </div>
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
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-secondary)] mb-1">
                {search || selectedLanguage || selectedRole || selectedStage || selectedTag
                  ? "没有找到匹配的提示词"
                  : "暂无公开提示词"}
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                {search || selectedLanguage || selectedRole || selectedStage || selectedTag
                  ? "试试调整搜索条件"
                  : "成为第一个分享者吧！"}
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link href="/login">
                  <Button>登录后分享</Button>
                </Link>
                <Link href="/prompts">
                  <Button variant="outline">返回我的提示词</Button>
                </Link>
              </div>
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
                    <PublicPromptCard
                      prompt={prompt}
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
    </div>
  );
}
