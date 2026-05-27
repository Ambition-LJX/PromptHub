"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CopyButton } from "@/components/common/CopyButton";
import { cn, highlightVariables } from "@/lib/utils";
import type { Prompt } from "@/types";

interface PromptCardProps {
  prompt: Prompt;
  onToggleFavorite?: (id: string, favorite: boolean) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export function PromptCard({ prompt, onToggleFavorite, onDelete, compact }: PromptCardProps) {
  const [expanded, setExpanded] = useState(false);
  const contentPreview = prompt.content.length > 160
    ? prompt.content.slice(0, 160) + "..."
    : prompt.content;

  return (
    <div
      className={cn(
        "glass-card group relative overflow-hidden",
        "animate-fade-in",
        prompt.isFavorite && "ring-1 ring-[var(--accent)]/30"
      )}
      style={prompt.isFavorite ? { boxShadow: "var(--shadow-glow)" } : undefined}
    >
      {prompt.isFavorite && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{
            background: "linear-gradient(90deg, var(--accent), var(--accent-hover))",
          }}
        />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2 mb-1.5">
              {prompt.isFavorite && (
                <span className="text-[var(--accent)]">
                  <svg className="h-3.5 w-3.5 animate-pulse-glow" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </span>
              )}
              <Link
                href={`/prompts/${prompt.id}`}
                className="font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors truncate"
              >
                {prompt.title}
              </Link>
            </div>

            {/* Description */}
            {prompt.description && (
              <p className="text-sm text-[var(--text-tertiary)] mb-2 line-clamp-1">
                {prompt.description}
              </p>
            )}

            {/* Content preview */}
            <div
              className={cn(
                "text-sm text-[var(--text-secondary)] font-mono leading-relaxed mb-3",
                !expanded && "line-clamp-2"
              )}
              style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
              dangerouslySetInnerHTML={{ __html: highlightVariables(expanded ? prompt.content : contentPreview) }}
            />

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {prompt.language.slice(0, 3).map((lang) => (
                <Badge key={lang} variant="accent" className="text-xs">
                  {lang}
                </Badge>
              ))}
              {prompt.role.slice(0, 2).map((role) => (
                <Badge key={role} variant="outline" className="text-xs">
                  {role}
                </Badge>
              ))}
              {prompt.stage.slice(0, 2).map((stage) => (
                <Badge key={stage} variant="subtle" className="text-xs">
                  {stage}
                </Badge>
              ))}
              {prompt.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <CopyButton text={prompt.content} />
            <button
              onClick={() => onToggleFavorite?.(prompt.id, !prompt.isFavorite)}
              className="p-1.5 rounded-lg transition-all duration-150 hover:bg-[var(--accent-subtle)]"
            >
              <svg className={cn("h-4 w-4", prompt.isFavorite ? "text-[var(--accent)]" : "text-[var(--text-muted)]")} fill={prompt.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/prompts/${prompt.id}`} className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg> 编辑
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 focus:text-red-400"
                  onClick={() => onDelete?.(prompt.id)}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg> 删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Expand toggle */}
        {!compact && prompt.content.length > 160 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-150"
          >
            {expanded ? (
              <><svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/></svg>收起</>
            ) : (
              <><svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>展开全部</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
