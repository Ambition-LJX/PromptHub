"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PromptCard } from "@/components/prompts/PromptCard";
import { TagSelector } from "@/components/common/TagSelector";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterPanel } from "@/components/common/FilterPanel";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LANGUAGES, ROLES, STAGES } from "@/types";
import { cn, extractVariables, highlightVariables } from "@/lib/utils";
import type { Prompt } from "@/types";

type Visibility = "PRIVATE" | "TEAM" | "SHARED";

const VISIBILITY_OPTIONS: { value: Visibility; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: "PRIVATE",
    label: "私有",
    description: "仅自己可见",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
  },
  {
    value: "TEAM",
    label: "团队",
    description: "团队成员可见",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    value: "SHARED",
    label: "共享",
    description: "所有人可见",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/>
        <circle cx="6" cy="12" r="3"/>
        <circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
  },
];

const DEFAULT_PAGE_SIZE = 20;

function CreatePromptDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState<string[]>([]);
  const [role, setRole] = useState<string[]>([]);
  const [stage, setStage] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<Visibility>("PRIVATE");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [creating, setCreating] = useState(false);

  const variables = extractVariables(content);
  const canSubmit = title.trim() && content.trim();
  const totalTags = language.length + role.length + stage.length + tags.length;

  useEffect(() => {
    if (!open) {
      setTitle("");
      setContent("");
      setDescription("");
      setLanguage([]);
      setRole([]);
      setStage([]);
      setCustomTagInput("");
      setTags([]);
      setVisibility("PRIVATE");
      setActiveTab("write");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleCreate();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = customTagInput.trim().replace(/,/g, "");
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setCustomTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleCreate = async () => {
    if (!canSubmit) return;
    setCreating(true);
    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, description, language, role, stage, tags, visibility }),
      });
      if (res.ok) {
        onOpenChange(false);
        onCreated();
      }
    } finally {
      setCreating(false);
    }
  };

  const mockPrompt = {
    id: "preview",
    title: title || "提示词标题",
    content: content || "在这里编辑提示词内容，实时预览效果...",
    description: description,
    language,
    role,
    stage,
    tags,
    isFavorite: false,
    versions: [],
    visibility,
    userId: "current",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[960px]">
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
                  创建新的 AI 提示词，支持多维度标签分类
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex flex-1 min-h-0 pt-4">

          {/* Left: Form Panel */}
          <div className="flex-1 overflow-y-auto px-7 pb-6 space-y-5">

            {/* Section: Basic Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "var(--accent-subtle)" }}>
                  <span className="text-[10px] font-black" style={{ color: "var(--accent)" }}>1</span>
                </div>
                <span className="text-xs font-bold tracking-wide uppercase" style={{ color: "var(--text-tertiary)" }}>
                  基本信息
                </span>
              </div>

              <div className="space-y-3 pl-7">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                    标题
                    <span style={{ color: "#f87171" }}>*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M4 6h16M4 12h16M4 18h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="例如：TypeScript 代码审查"
                      className="pl-9 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>描述</label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="简短描述用途（可选）"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="pl-7">
              <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
            </div>

            {/* Section: Content */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "var(--accent-subtle)" }}>
                  <span className="text-[10px] font-black" style={{ color: "var(--accent)" }}>2</span>
                </div>
                <span className="text-xs font-bold tracking-wide uppercase" style={{ color: "var(--text-tertiary)" }}>
                  内容编辑
                </span>
              </div>

              <div className="space-y-2 pl-7">
                {/* Tab switcher + toolbar row */}
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
                    {content && activeTab === "write" && (
                      <button
                        onClick={() => setContent("")}
                        className="text-[11px] px-2 py-1 rounded-md transition-colors"
                        style={{ color: "var(--text-muted)", background: "transparent" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-muted)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                      >
                        清空
                      </button>
                    )}
                    <span className="text-[11px] tabular-nums" style={{ color: "var(--text-muted)" }}>
                      {content.length} 字符
                    </span>
                  </div>
                </div>

                {activeTab === "write" ? (
                  <div className="space-y-2">
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={"输入提示词内容，可以使用 {{variable}} 作为变量占位符..."}
                      className="min-h-[180px] text-sm"
                      style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: "0.8125rem", resize: "vertical", lineHeight: "1.6" }}
                    />
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      支持 {"{{variable}}"} 语法定义变量占位符
                    </p>
                  </div>
                ) : (
                  <div
                    className="rounded-xl border min-h-[180px] p-4 overflow-auto"
                    style={{
                      background: "var(--surface-glass)",
                      borderColor: "var(--border-default)",
                      fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                      fontSize: "0.8125rem",
                      lineHeight: "1.6",
                    }}
                    dangerouslySetInnerHTML={{ __html: highlightVariables(content || "<span style='color:var(--text-muted)'>预览区域...</span>") }}
                  />
                )}

                {/* Variables detected */}
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
              <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
            </div>

            {/* Section: Tags */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "var(--accent-subtle)" }}>
                  <span className="text-[10px] font-black" style={{ color: "var(--accent)" }}>3</span>
                </div>
                <span className="text-xs font-bold tracking-wide uppercase" style={{ color: "var(--text-tertiary)" }}>
                  标签分类
                </span>
              </div>

              <div className="space-y-4 pl-7">
                <TagSelector label="语言" options={LANGUAGES} value={language} onChange={setLanguage} />
                <TagSelector label="角色" options={ROLES} value={role} onChange={setRole} />
                <TagSelector label="开发阶段" options={STAGES} value={stage} onChange={setStage} />

                {/* Custom tags */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>自定义标签</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="7" cy="7" r="1.5" fill="currentColor" />
                      </svg>
                    </span>
                    <Input
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="输入标签后按 Enter 添加"
                      className="pl-8 text-sm"
                    />
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer pr-1 text-xs"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          #{tag}
                          <svg className="ml-0.5 h-3 w-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="pl-7">
              <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
            </div>

            {/* Section: Visibility */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "var(--accent-subtle)" }}>
                  <span className="text-[10px] font-black" style={{ color: "var(--accent)" }}>4</span>
                </div>
                <span className="text-xs font-bold tracking-wide uppercase" style={{ color: "var(--text-tertiary)" }}>
                  可见范围
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pl-7">
                {VISIBILITY_OPTIONS.map((opt) => {
                  const isSelected = visibility === opt.value;
                  const colors = {
                    PRIVATE: { dot: "#f87171", text: "#f87171" },
                    TEAM: { dot: "#fbbf24", text: "#fbbf24" },
                    SHARED: { dot: "#34d399", text: "#34d399" },
                  };
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setVisibility(opt.value)}
                      className="relative flex flex-col items-center gap-2 rounded-xl p-3 border transition-all duration-200 text-center"
                      style={{
                        borderColor: isSelected ? colors[opt.value].text : "var(--border-default)",
                        background: isSelected ? `${colors[opt.value].text}12` : "transparent",
                        boxShadow: isSelected ? `0 0 12px ${colors[opt.value].text}20` : "none",
                      }}
                    >
                      <span style={{ color: isSelected ? colors[opt.value].text : "var(--text-muted)", transition: "color 0.2s" }}>
                        {opt.icon}
                      </span>
                      <div>
                        <div className="text-sm font-bold transition-colors" style={{ color: isSelected ? colors[opt.value].text : "var(--text-secondary)" }}>
                          {opt.label}
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {opt.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Live Preview Panel */}
          <div
            className="w-[280px] shrink-0 overflow-y-auto px-5 py-5 flex flex-col gap-4"
            style={{ borderLeft: "1px solid var(--border-subtle)", background: "var(--surface-glass)" }}
          >
            {/* Panel header */}
            <div className="flex items-center gap-2 pb-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                实时预览
              </span>
            </div>

            {/* Preview card */}
            <div className="relative">
              <PromptCard prompt={mockPrompt} compact={false} />
            </div>

            {/* Stats */}
            <div className="rounded-xl p-3 space-y-2" style={{ background: "var(--surface-elevated)", border: "1px solid var(--border-subtle)" }}>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                统计信息
              </div>
              <div className="space-y-1.5">
                {[
                  { label: "字符数", value: content.length, color: "var(--accent)" },
                  { label: "变量数", value: variables.length, color: "var(--accent-hover)" },
                  { label: "标签数", value: totalTags, color: "#a78bfa" },
                  {
                    label: "可见性",
                    value: visibility === "PRIVATE" ? "私有" : visibility === "TEAM" ? "团队" : "共享",
                    color: visibility === "PRIVATE" ? "#f87171" : visibility === "TEAM" ? "#fbbf24" : "#34d399",
                    isText: true,
                  },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: stat.color }} />
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{stat.label}</span>
                    </div>
                    <span className="text-[11px] font-bold tabular-nums" style={{ color: stat.isText ? stat.color : "var(--text-secondary)" }}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-xl p-3 space-y-1.5" style={{ background: "var(--accent-muted)", border: "1px solid var(--border-subtle)" }}>
              <div className="text-[11px] font-bold" style={{ color: "var(--accent)" }}>
                提示
              </div>
              <ul className="space-y-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                <li className="flex items-start gap-1">
                  <span style={{ color: "var(--accent)" }}>·</span>
                  <span>使用 {"{{变量名}}"} 定义占位符</span>
                </li>
                <li className="flex items-start gap-1">
                  <span style={{ color: "var(--accent)" }}>·</span>
                  <span>Ctrl+Enter 快速创建</span>
                </li>
                <li className="flex items-start gap-1">
                  <span style={{ color: "var(--accent)" }}>·</span>
                  <span>清晰的标题便于搜索</span>
                </li>
              </ul>
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
                onClick={handleCreate}
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

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [isFavoriteOnly, setIsFavoriteOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreate, setShowCreate] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const totalPages = Math.ceil(total / pageSize);

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

  const clearFilters = () => {
    setSelectedLanguage("");
    setSelectedRole("");
    setSelectedStage("");
    setSelectedTag("");
    setIsFavoriteOnly(false);
    setSearch("");
    setDebouncedSearch("");
  };

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
    setPage(1);
    fetchPrompts();
  };

  const handleBulkDelete = async () => {
    if (!confirm(`确定要删除选中的 ${selected.size} 个提示词吗？此操作不可撤销。`)) return;
    await Promise.all(
      Array.from(selected).map((id) =>
        fetch(`/api/prompts/${id}`, { method: "DELETE" })
      )
    );
    setSelected(new Set());
    setShowBulkDelete(false);
    setPage(1);
    fetchPrompts();
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === prompts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(prompts.map((p) => p.id)));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">
            <span className="gradient-text">提示词管理</span>
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
            {loading ? "加载中..." : `共 ${total} 个提示词`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setShowBulkDelete(true)}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              删除 ({selected.size})
            </Button>
          )}
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
            新建
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
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

        <div className="flex-1 min-w-0">
          <div className="mb-5">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="搜索提示词标题、内容、标签..."
            />
          </div>

          {prompts.length > 0 && (
            <div
              className="flex items-center gap-3 mb-4 pb-3"
              style={{ borderBottom: "1px solid var(--border-default)" }}
            >
              <Button variant="outline" size="sm" onClick={selectAll}>
                {selected.size === prompts.length ? "取消全选" : "全选"}
              </Button>
              <span className="text-sm text-[var(--text-muted)]">
                已选择 <span className="font-semibold text-[var(--accent)]">{selected.size}</span> / {prompts.length}
              </span>
            </div>
          )}

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
                      "relative group opacity-0 animate-fade-in",
                      `stagger-${Math.min(index + 1, 8)}`
                    )}
                  >
                    {selected.size > 0 && (
                      <input
                        type="checkbox"
                        checked={selected.has(prompt.id)}
                        onChange={() => toggleSelect(prompt.id)}
                        className="absolute left-3 top-3 z-10 h-4 w-4 rounded border-[var(--border-strong)] text-[var(--accent)] focus:ring-[var(--accent)]/40 cursor-pointer"
                      />
                    )}
                    <div className={cn(selected.has(prompt.id) && "ml-6")}>
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

      <CreatePromptDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={fetchPrompts}
      />

      {/* Bulk Delete Dialog */}
      <Dialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="items-center text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 mx-auto"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ color: "#f87171" }}>
                <path d="M12 9v4M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <DialogTitle>确认批量删除</DialogTitle>
            <DialogDescription>
              确定要删除选中的 <span className="font-semibold" style={{ color: "var(--accent)" }}>{selected.size}</span> 个提示词吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDelete(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              className="min-w-[100px]"
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
