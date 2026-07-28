"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/common/CopyButton";
import { cn, highlightVariables, formatDate } from "@/lib/utils";

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

interface PublicPromptCardProps {
  prompt: PublicPrompt;
  compact?: boolean;
}

export function PublicPromptCard({ prompt, compact = false }: PublicPromptCardProps) {
  const [expanded, setExpanded] = useState(false);
  const contentPreview = prompt.content.length > 200
    ? prompt.content.slice(0, 200) + "..."
    : prompt.content;

  return (
    <div
      className={cn(
        "glass-card group relative overflow-hidden",
        "animate-fade-in"
      )}
    >
      {/* Public indicator */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{
          background: "linear-gradient(90deg, #34d399, #10b981)",
        }}
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Link
                href={`/public/${prompt.id}`}
                className="font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors truncate"
              >
                {prompt.title}
              </Link>
              {/* Public badge */}
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex-shrink-0">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                公开
              </span>
            </div>

            {/* Author info */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
                >
                  {prompt.user.username.charAt(0).toUpperCase()}
                </div>
                <span>{prompt.user.username}</span>
              </div>
              <span className="text-[var(--text-muted)]">·</span>
              <span className="text-xs text-[var(--text-muted)]">
                {formatDate(prompt.updatedAt)}
              </span>
            </div>

            {/* Description */}
            {prompt.description && (
              <p className="text-sm text-[var(--text-tertiary)] mb-2 line-clamp-2">
                {prompt.description}
              </p>
            )}

            {/* Content preview */}
            <div
              className={cn(
                "text-sm text-[var(--text-secondary)] font-mono leading-relaxed mb-3",
                !expanded && "line-clamp-3"
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
              {prompt.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <CopyButton text={prompt.content} />
            <Link href={`/public/${prompt.id}`}>
              <button
                className="p-1.5 rounded-lg transition-all duration-150 hover:bg-[var(--accent-subtle)]"
                title="查看详情"
              >
                <svg className="h-4 w-4 text-[var(--text-muted)] hover:text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </Link>
          </div>
        </div>

        {/* Expand toggle */}
        {!compact && prompt.content.length > 200 && (
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
