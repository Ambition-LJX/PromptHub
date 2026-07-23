"use client";

import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/common/CopyButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ProjectStage, Prompt } from "@/types";

interface StageTimelineProps {
  stages: ProjectStage[];
  onStageUpdate?: () => void;
}

export function StageTimeline({ stages, onStageUpdate }: StageTimelineProps) {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [selectorStage, setSelectorStage] = useState<ProjectStage | null>(null);
  const [allPrompts, setAllPrompts] = useState<Pick<Prompt, "id" | "title" | "content">[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPromptIds, setSelectedPromptIds] = useState<string[]>([]);

  const toggleStage = (stageId: string) => {
    setExpandedStage(expandedStage === stageId ? null : stageId);
  };

  const loadAllPrompts = useCallback(async () => {
    setLoadingPrompts(true);
    try {
      const res = await fetch("/api/prompts/picker?pageSize=100");
      if (res.ok) {
        const data = await res.json();
        setAllPrompts(data.prompts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPrompts(false);
    }
  }, []);

  const openSelector = (stage: ProjectStage) => {
    setSelectorStage(stage);
    setSelectedPromptIds([...stage.promptIds]);
    if (allPrompts.length === 0) {
      loadAllPrompts();
    }
  };

  const closeSelector = () => {
    setSelectorStage(null);
    setSelectedPromptIds([]);
  };

  const togglePrompt = (id: string) => {
    setSelectedPromptIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const setPrimaryPrompt = async (stageId: string, promptId: string | null) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return;
    
    try {
      await fetch(`/api/projects/stages/${stageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primaryPromptId: promptId }),
      });
      onStageUpdate?.();
    } catch (e) {
      console.error(e);
    }
  };

  const removePromptFromStage = async (stageId: string, promptId: string) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return;
    
    const newPromptIds = stage.promptIds.filter(id => id !== promptId);
    const newPrimaryId = stage.primaryPromptId === promptId ? null : stage.primaryPromptId;
    
    try {
      await fetch(`/api/projects/stages/${stageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptIds: newPromptIds, primaryPromptId: newPrimaryId }),
      });
      onStageUpdate?.();
    } catch (e) {
      console.error(e);
    }
  };

  const saveStagePrompts = async () => {
    if (!selectorStage) return;
    setSaving(true);
    try {
      await fetch(`/api/projects/stages/${selectorStage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptIds: selectedPromptIds }),
      });
      closeSelector();
      onStageUpdate?.();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (stages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="h-14 w-14 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: "var(--accent-subtle)", border: "1px solid var(--border-default)" }}
        >
          <svg className="h-6 w-6" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <p className="text-[var(--text-muted)]">暂无阶段定义</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {stages.map((stage, index) => {
        const isLast = index === stages.length - 1;
        const isExpanded = expandedStage === stage.id;
        const hasPrompts = stage.promptIds && stage.promptIds.length > 0;
        const hasPrimary = !!stage.primaryPromptId;
        const prompts = stage.prompts || [];

        return (
          <div key={stage.id} className="relative animate-fade-in" style={{ animationDelay: `${index * 0.08}s` }}>
            {!isLast && (
              <div
                className="absolute left-5 top-10 bottom-0 w-0.5"
                style={{
                  background: "linear-gradient(180deg, var(--border-strong) 0%, var(--border-subtle) 100%)",
                }}
              />
            )}

            <div className="relative flex items-start gap-4">
              <div
                className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all duration-300 z-10",
                  hasPrompts
                    ? "text-white"
                    : "text-[var(--text-muted)]"
                )}
                style={
                  hasPrompts
                    ? {
                        background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
                        borderColor: "var(--accent)",
                        boxShadow: "0 0 15px var(--accent-glow)",
                      }
                    : {
                        background: "var(--surface-glass)",
                        borderColor: "var(--border-default)",
                      }
                }
              >
                {index + 1}
              </div>

              <div className="flex-1 min-w-0 pb-8">
                <button
                  onClick={() => toggleStage(stage.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200",
                    isExpanded
                      ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
                      : "border-[var(--border-default)] bg-[var(--surface-card)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-card-hover)]"
                  )}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[var(--text-primary)]">
                      {stage.name}
                    </span>
                    {hasPrimary && (
                      <Badge variant="default" className="text-xs">
                        主提示词
                      </Badge>
                    )}
                    {hasPrompts && !hasPrimary && (
                      <Badge variant="accent" className="text-xs">
                        {stage.promptIds.length} 个提示词
                      </Badge>
                    )}
                  </div>
                  <svg
                    className={cn("h-4 w-4 text-[var(--text-muted)]", isExpanded ? "text-[var(--accent)]" : "")}
                    style={{ flexShrink: 0, transform: isExpanded ? "rotate(180deg)" : "none" }}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {isExpanded && (
                  <div
                    className="mt-3 p-4 rounded-xl border animate-fade-in"
                    style={{
                      background: "var(--surface-glass)",
                      borderColor: "var(--border-default)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-[var(--text-tertiary)]">
                        {hasPrompts ? `共 ${stage.promptIds.length} 个关联提示词` : "暂无关联提示词"}
                      </p>
                      <Button variant="outline" size="sm" onClick={() => openSelector(stage)}>
                        <svg className="h-3.5 w-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                        </svg>
                        {hasPrompts ? "管理提示词" : "添加提示词"}
                      </Button>
                    </div>

                    {hasPrompts ? (
                      <div className="space-y-2">
                        {(prompts.length > 0 ? prompts : Array(stage.promptIds.length).fill(null)).map((prompt, i) => {
                          if (!prompt) {
                            return (
                              <div
                                key={i}
                                className="p-3 rounded-xl border animate-pulse"
                                style={{
                                  background: "var(--surface-card)",
                                  borderColor: "var(--border-subtle)",
                                }}
                              >
                                <div className="h-4 w-1/3 rounded mb-2" style={{ background: "var(--border-subtle)" }} />
                                <div className="h-3 w-2/3 rounded" style={{ background: "var(--border-subtle)" }} />
                              </div>
                            );
                          }
                          const isPrimary = stage.primaryPromptId === prompt.id;
                          return (
                            <div
                              key={prompt.id}
                              className="p-3 rounded-xl border group relative"
                              style={{
                                background: isPrimary ? "var(--accent-subtle)" : "var(--surface-card)",
                                borderColor: isPrimary ? "var(--accent)" : "var(--border-subtle)",
                              }}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                                    {prompt.title}
                                  </h4>
                                  {isPrimary && (
                                    <Badge variant="default" className="text-xs shrink-0">主</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {!isPrimary && (
                                    <button
                                      onClick={() => setPrimaryPrompt(stage.id, prompt.id)}
                                      className="p-1 rounded hover:bg-[var(--accent-subtle)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                                      title="设为主提示词"
                                    >
                                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                                      </svg>
                                    </button>
                                  )}
                                  <CopyButton text={prompt.content} />
                                  <button
                                    onClick={() => removePromptFromStage(stage.id, prompt.id)}
                                    className="p-1 rounded hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                                    title="移除"
                                  >
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <pre
                                className="text-xs leading-relaxed overflow-hidden whitespace-pre-wrap rounded-lg p-2 font-mono"
                                style={{
                                  background: "var(--surface-elevated)",
                                  color: "var(--text-tertiary)",
                                  maxHeight: "80px",
                                }}
                              >
                                {prompt.content.length > 150 ? prompt.content.slice(0, 150) + "..." : prompt.content}
                              </pre>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--text-muted)] text-center py-4">
                        点击上方按钮添加提示词到此阶段
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <Dialog open={!!selectorStage} onOpenChange={closeSelector}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectorStage ? `为「${selectorStage.name}」选择提示词` : "选择提示词"}
            </DialogTitle>
            <DialogDescription>
              勾选要关联到此阶段的提示词，可设置一个为主提示词
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 max-h-[50vh] overflow-y-auto py-2">
            {loadingPrompts ? (
              <div className="flex items-center justify-center py-8">
                <svg className="h-5 w-5 animate-spin" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              </div>
            ) : allPrompts.length > 0 ? (
              allPrompts.map((p) => (
                <label
                  key={p.id}
                  className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                  style={{
                    borderColor: selectedPromptIds.includes(p.id) ? "var(--accent)" : "var(--border-default)",
                    background: selectedPromptIds.includes(p.id) ? "var(--accent-subtle)" : "transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedPromptIds.includes(p.id)}
                    onChange={() => togglePrompt(p.id)}
                    className="mt-0.5 rounded border-[var(--border-strong)] text-[var(--accent)] focus:ring-[var(--accent)]/40"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-sm text-[var(--text-primary)]">{p.title}</span>
                    <p className="text-xs text-[var(--text-muted)] font-mono truncate mt-0.5">
                      {p.content.slice(0, 80)}...
                    </p>
                  </div>
                </label>
              ))
            ) : (
              <p className="text-sm text-[var(--text-muted)] text-center py-8">
                暂无可用提示词，请先创建提示词
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeSelector}>
              取消
            </Button>
            <Button onClick={saveStagePrompts} disabled={saving}>
              {saving ? "保存中..." : `保存 (${selectedPromptIds.length} 个)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
