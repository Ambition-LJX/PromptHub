"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CopyButton } from "@/components/common/CopyButton";
import { cn } from "@/lib/utils";
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

interface WorkspaceCardProps {
  workspace: LightWorkspace;
  onDelete: (id: string) => void;
  onDownload: (ws: FullWorkspace) => void;
  onExport: (md: string) => void;
}

export function WorkspaceCard({ workspace, onDelete, onDownload, onExport }: WorkspaceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [fullWorkspace, setFullWorkspace] = useState<FullWorkspace | null>(null);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [showPromptSelector, setShowPromptSelector] = useState(false);
  const [pickerPrompts, setPickerPrompts] = useState<Pick<Prompt, "id" | "title" | "content">[]>([]);
  const [loadingPicker, setLoadingPicker] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const loadFullWorkspace = useCallback(async () => {
    if (fullWorkspace) return;
    setLoadingPrompts(true);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}`);
      if (res.ok) {
        const data = await res.json();
        setFullWorkspace(data);
        setSelectedIds(data.prompts.map((p: Prompt) => p.id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPrompts(false);
    }
  }, [workspace.id, fullWorkspace]);

  const handleToggle = async () => {
    if (!expanded) {
      await loadFullWorkspace();
    }
    setExpanded(!expanded);
  };

  const loadPromptPicker = async () => {
    setLoadingPicker(true);
    try {
      const res = await fetch("/api/prompts/picker");
      if (res.ok) {
        const data = await res.json();
        setPickerPrompts(data.prompts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPicker(false);
    }
  };

  const handleOpenSelector = () => {
    if (pickerPrompts.length === 0) {
      loadPromptPicker();
    }
    setShowPromptSelector(true);
  };

  const handleSavePrompts = async () => {
    await fetch(`/api/workspaces/${workspace.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptIds: selectedIds }),
    });
    setShowPromptSelector(false);
    if (fullWorkspace) {
      const res = await fetch(`/api/workspaces/${workspace.id}`);
      if (res.ok) setFullWorkspace(await res.json());
    }
  };

  const togglePrompt = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const copyAllPrompts = async () => {
    if (!fullWorkspace) return;
    const text = fullWorkspace.prompts.map((p) => `【${p.title}】\n${p.content}`).join("\n\n---\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportMarkdownFn = () => {
    if (!fullWorkspace) return;
    let md = `# ${fullWorkspace.name}\n\n`;
    if (fullWorkspace.description) md += `${fullWorkspace.description}\n\n`;
    md += `---\n\n`;
    fullWorkspace.prompts.forEach((p) => {
      md += `## 【${p.title}】\n\n\`\`\`\n${p.content}\n\`\`\`\n\n`;
    });
    onExport(md);
  };

  return (
    <div
      className="glass-card overflow-hidden"
      style={{
        background: expanded ? "var(--surface-card-hover)" : undefined,
      }}
    >
      {/* Clickable header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer group transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center"
            style={{
              background: "var(--accent-subtle)",
              border: "1px solid var(--border-default)",
            }}
          >
            <svg className="h-5 w-5" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{workspace.name}</h3>
            <p className="text-sm text-[var(--text-muted)]">
              {workspace.description || "暂无描述"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {fullWorkspace && (
            <>
              <Button variant="ghost" size="sm" onClick={copyAllPrompts} className="text-[var(--text-muted)] hover:text-[var(--accent)]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                {copied && <span className="ml-1 text-xs text-green-400">已复制</span>}
              </Button>
              <Button variant="ghost" size="sm" onClick={exportMarkdownFn} className="text-[var(--text-muted)] hover:text-[var(--accent)]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
                onClick={() => onDelete(workspace.id)}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </Button>
            </>
          )}
          <svg
            className={cn(
              "h-4 w-4 text-[var(--text-muted)] transition-transform duration-200",
              expanded && "rotate-90"
            )}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div
          className="border-t"
          style={{
            borderColor: "var(--border-subtle)",
            background: "var(--surface-glass)",
          }}
        >
          {loadingPrompts ? (
            <div className="flex items-center justify-center py-8">
              <svg className="h-5 w-5 animate-spin" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span className="ml-2 text-sm text-[var(--text-tertiary)]">加载提示词...</span>
            </div>
          ) : fullWorkspace ? (
            <>
              <div className="flex items-center justify-between p-4">
                <span className="text-sm font-semibold text-[var(--text-tertiary)]">
                  包含 <span className="text-[var(--accent)]">{fullWorkspace.prompts.length}</span> 个提示词
                </span>
                <Button variant="outline" size="sm" onClick={handleOpenSelector}>
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                  添加提示词
                </Button>
              </div>

              {fullWorkspace.prompts.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] text-center py-6">暂未添加提示词</p>
              ) : (
                <div className="space-y-2 px-4 pb-4">
                  {fullWorkspace.prompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      className="flex items-center justify-between p-3 rounded-xl border"
                      style={{
                        background: "var(--surface-card)",
                        borderColor: "var(--border-subtle)",
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-[var(--text-primary)]">{prompt.title}</span>
                          {prompt.language.slice(0, 1).map((l) => (
                            <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>
                          ))}
                        </div>
                        <p
                          className="text-xs text-[var(--text-muted)] truncate"
                          style={{ fontFamily: "var(--font-mono, monospace)" }}
                        >
                          {prompt.content.slice(0, 80)}...
                        </p>
                      </div>
                      <CopyButton text={prompt.content} />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end px-4 pb-4">
                <Button variant="outline" size="sm" onClick={() => onDownload(fullWorkspace)}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  下载 Markdown
                </Button>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Prompt selector dialog */}
      <Dialog open={showPromptSelector} onOpenChange={setShowPromptSelector}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>选择提示词</DialogTitle>
            <DialogDescription>勾选要添加到工作集的提示词</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto py-2">
            {loadingPicker ? (
              <div className="flex items-center justify-center py-8">
                <svg className="h-5 w-5 animate-spin" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              </div>
            ) : pickerPrompts.length > 0 ? (
              pickerPrompts.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                  style={{
                    borderColor: selectedIds.includes(p.id) ? "var(--accent)" : "var(--border-default)",
                    background: selectedIds.includes(p.id) ? "var(--accent-subtle)" : "transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.id)}
                    onChange={() => togglePrompt(p.id)}
                    className="rounded border-[var(--border-strong)] text-[var(--accent)] focus:ring-[var(--accent)]/40"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-sm text-[var(--text-primary)]">{p.title}</span>
                    <p className="text-xs text-[var(--text-muted)] font-mono truncate">
                      {p.content.slice(0, 60)}...
                    </p>
                  </div>
                </label>
              ))
            ) : (
              <p className="text-sm text-[var(--text-muted)] text-center py-8">暂无可用提示词</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPromptSelector(false)}>
              取消
            </Button>
            <Button onClick={handleSavePrompts}>
              保存 ({selectedIds.length} 个)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
