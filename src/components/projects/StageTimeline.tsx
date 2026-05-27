"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/common/CopyButton";
import { cn } from "@/lib/utils";
import type { ProjectStage } from "@/types";

interface StageTimelineProps {
  stages: ProjectStage[];
}

export function StageTimeline({ stages }: StageTimelineProps) {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  const toggleStage = (stageId: string) => {
    setExpandedStage(expandedStage === stageId ? null : stageId);
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

        return (
          <div key={stage.id} className="relative animate-fade-in" style={{ animationDelay: `${index * 0.08}s` }}>
            {/* Connecting line */}
            {!isLast && (
              <div
                className="absolute left-5 top-10 bottom-0 w-0.5"
                style={{
                  background: "linear-gradient(180deg, var(--border-strong) 0%, var(--border-subtle) 100%)",
                }}
              />
            )}

            <div className="relative flex items-start gap-4">
              {/* Node circle */}
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

              {/* Content card */}
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

                {/* Expanded content */}
                {isExpanded && (
                  <div
                    className="mt-3 p-4 rounded-xl border animate-fade-in"
                    style={{
                      background: "var(--surface-glass)",
                      borderColor: "var(--border-default)",
                    }}
                  >
                    {hasPrompts ? (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-[var(--text-tertiary)]">
                          共 {stage.promptIds.length} 个关联提示词
                        </p>
                        {stage.prompt && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-bold text-[var(--text-primary)]">
                              {stage.prompt.title}
                            </h4>
                            <div className="relative group">
                              <pre
                                className="text-xs leading-relaxed overflow-x-auto max-h-48 whitespace-pre-wrap rounded-lg border p-3"
                                style={{
                                  background: "var(--surface-card)",
                                  borderColor: "var(--border-subtle)",
                                  color: "var(--text-secondary)",
                                  fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                                }}
                              >
                                {stage.prompt.content}
                              </pre>
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CopyButton text={stage.prompt.content} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--text-muted)] text-center py-4">
                        暂无关联提示词，请在编辑页面中添加
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
