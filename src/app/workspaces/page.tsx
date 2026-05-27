"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { WorkspaceCard } from "@/components/workspaces/WorkspaceCard";
import type { Prompt } from "@/types";

interface LightWorkspace {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FullWorkspace extends LightWorkspace {
  prompts: Prompt[];
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<LightWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [exportMarkdown, setExportMarkdown] = useState<string>("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const totalPages = Math.ceil(total / pageSize);

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      const res = await fetch(`/api/workspaces/lightweight?${params.toString()}`);
      const data = await res.json();
      if (data.workspaces) {
        setWorkspaces(data.workspaces);
        setTotal(data.total);
      } else if (Array.isArray(data)) {
        setWorkspaces(data);
        setTotal(data.length);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleCreate = async () => {
    if (!createForm.name) return;
    setCreating(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      if (res.ok) {
        setShowCreate(false);
        setCreateForm({ name: "", description: "" });
        setPage(1);
        fetchWorkspaces();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除此工作集吗？")) return;
    await fetch(`/api/workspaces/${id}`, { method: "DELETE" });
    fetchWorkspaces();
  };

  const downloadMarkdown = (workspace: FullWorkspace) => {
    const md = `# ${workspace.name}\n\n${workspace.description ? workspace.description + "\n\n" : ""}---\n\n${workspace.prompts.map((p) => `## 【${p.title}】\n\n\`\`\`\n${p.content}\n\`\`\`\n\n`).join("")}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workspace.name}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">
            <span className="gradient-text">工作集</span>
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
            {loading ? "加载中..." : `共 ${total} 个工作集`}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          新建工作集
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-[var(--border-default)]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent" style={{ borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
            <div className="absolute inset-1 rounded-full border-2 border-transparent" style={{ borderBottomColor: "var(--accent-hover)", animation: "spin 1.2s linear infinite reverse" }} />
          </div>
        </div>
      ) : workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-20 w-20 rounded-3xl flex items-center justify-center mb-5" style={{ background: "var(--accent-subtle)", border: "1px solid var(--border-default)" }}>
            <svg className="h-9 w-9" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          </div>
          <h3 className="text-lg font-bold text-[var(--text-secondary)] mb-1">还没有工作集</h3>
          <p className="text-sm text-[var(--text-muted)] mb-5">创建工作集，组合多个提示词快速使用</p>
          <Button onClick={() => setShowCreate(true)}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            创建工作集
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {workspaces.map((ws) => (
              <WorkspaceCard
                key={ws.id}
                workspace={ws}
                onDelete={handleDelete}
                onDownload={downloadMarkdown}
                onExport={setExportMarkdown}
              />
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
              <span className="text-sm text-[var(--text-tertiary)]">
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

      <CreateWorkspaceDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        createForm={createForm}
        setCreateForm={setCreateForm}
        onCreate={handleCreate}
        creating={creating}
      />

      <ExportMarkdownDialog
        markdown={exportMarkdown}
        onClose={() => setExportMarkdown("")}
      />
    </div>
  );
}

type CreateWorkspaceDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  createForm: { name: string; description: string };
  setCreateForm: React.Dispatch<React.SetStateAction<{ name: string; description: string }>>;
  onCreate: () => void;
  creating: boolean;
};

function CreateWorkspaceDialog({ open, onOpenChange, createForm, setCreateForm, onCreate, creating }: CreateWorkspaceDialogProps) {
  const canSubmit = createForm.name.trim();

  useEffect(() => {
    if (!open) {
      setCreateForm({ name: "", description: "" });
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
      <DialogContent className="max-w-md">
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
        <DialogHeader className="px-6 pt-5 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
                  boxShadow: "0 4px 14px var(--accent-glow)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <div>
                <DialogTitle className="text-[1.05rem] font-bold">新建工作集</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  创建一个新的工作集，稍后可添加提示词
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
              工作集名称 <span style={{ color: "#f87171" }}>*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="例如：代码审查工作集"
                className="pl-9 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>描述</label>
            <Textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="简短描述这个工作集的用途..."
              className="min-h-[60px] text-sm resize-none"
            />
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
                    创建工作集
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

type ExportMarkdownDialogProps = {
  markdown: string;
  onClose: () => void;
};

function ExportMarkdownDialog({ markdown, onClose }: ExportMarkdownDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 800);
  };

  if (!markdown) return null;

  return (
    <Dialog open={!!markdown} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
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
        <DialogHeader className="px-6 pt-5 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
                  boxShadow: "0 4px 14px var(--accent-glow)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
              </div>
              <div>
                <DialogTitle className="text-[1.05rem] font-bold">导出 Markdown</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  复制以下内容或直接下载文件
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-4">
          <div className="relative rounded-xl border overflow-hidden" style={{ background: "var(--surface-card)", borderColor: "var(--border-default)" }}>
            <pre
              className="w-full max-h-[50vh] overflow-auto p-4 text-sm"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                lineHeight: "1.6",
              }}
            >
              {markdown}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter style={{ borderTop: "1px solid var(--border-subtle)", padding: "16px 24px", background: "var(--surface-glass)" }}>
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {markdown.length} 字符
            </span>
            <Button
              onClick={handleCopy}
              size="sm"
              className="min-w-[120px]"
            >
              {copied ? (
                <span className="flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  已复制!
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  复制并关闭
                </span>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
