"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LANGUAGES, ROLES, STAGES } from "@/types";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  selectedLanguage: string;
  selectedRole: string;
  selectedStage: string;
  onLanguageChange: (v: string) => void;
  onRoleChange: (v: string) => void;
  onStageChange: (v: string) => void;
  selectedTag: string;
  onTagChange: (v: string) => void;
  allTags: string[];
  isFavoriteOnly: boolean;
  onFavoriteChange: (v: boolean) => void;
  onClear: () => void;
}

export function FilterPanel({
  selectedLanguage,
  selectedRole,
  selectedStage,
  onLanguageChange,
  onRoleChange,
  onStageChange,
  selectedTag,
  onTagChange,
  allTags,
  isFavoriteOnly,
  onFavoriteChange,
  onClear,
}: FilterPanelProps) {
  const [openSections, setOpenSections] = useState({
    language: true,
    role: true,
    stage: true,
    tags: false,
  });

  const toggle = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasFilters = selectedLanguage || selectedRole || selectedStage || selectedTag || isFavoriteOnly;

  return (
    <div className="space-y-1">
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="w-full text-xs text-[var(--text-muted)] hover:text-red-400 justify-start"
        >
          清除所有筛选
        </Button>
      )}

      <FilterSection
        title="语言"
        count={selectedLanguage ? 1 : 0}
        open={openSections.language}
        onToggle={() => toggle("language")}
      >
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => onLanguageChange(selectedLanguage === lang ? "" : lang)}
            className={cn(
              "w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-all duration-150",
              selectedLanguage === lang
                ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold"
                : "text-[var(--text-secondary)] hover:bg-[var(--accent-muted)] hover:text-[var(--text-primary)]"
            )}
          >
            {lang}
          </button>
        ))}
      </FilterSection>

      <FilterSection
        title="角色"
        count={selectedRole ? 1 : 0}
        open={openSections.role}
        onToggle={() => toggle("role")}
      >
        {ROLES.map((role) => (
          <button
            key={role}
            onClick={() => onRoleChange(selectedRole === role ? "" : role)}
            className={cn(
              "w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-all duration-150",
              selectedRole === role
                ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold"
                : "text-[var(--text-secondary)] hover:bg-[var(--accent-muted)] hover:text-[var(--text-primary)]"
            )}
          >
            {role}
          </button>
        ))}
      </FilterSection>

      <FilterSection
        title="开发阶段"
        count={selectedStage ? 1 : 0}
        open={openSections.stage}
        onToggle={() => toggle("stage")}
      >
        {STAGES.map((stage) => (
          <button
            key={stage}
            onClick={() => onStageChange(selectedStage === stage ? "" : stage)}
            className={cn(
              "w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-all duration-150",
              selectedStage === stage
                ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold"
                : "text-[var(--text-secondary)] hover:bg-[var(--accent-muted)] hover:text-[var(--text-primary)]"
            )}
          >
            {stage}
          </button>
        ))}
      </FilterSection>

      {allTags.length > 0 && (
        <FilterSection
          title="标签"
          count={selectedTag ? 1 : 0}
          open={openSections.tags}
          onToggle={() => toggle("tags")}
        >
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagChange(selectedTag === tag ? "" : tag)}
              className={cn(
                "w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-all duration-150",
                selectedTag === tag
                  ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold"
                  : "text-[var(--text-secondary)] hover:bg-[var(--accent-muted)] hover:text-[var(--text-primary)]"
              )}
            >
              #{tag}
            </button>
          ))}
        </FilterSection>
      )}

      <div className="pt-3 px-2">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <Checkbox
            checked={isFavoriteOnly}
            onCheckedChange={(v: boolean | "indeterminate") => onFavoriteChange(!!v)}
          />
          <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
            只看收藏
          </span>
        </label>
      </div>
    </div>
  );
}

function FilterSection({
  title,
  count,
  open,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-2.5 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-muted)] rounded-xl transition-all duration-150"
      >
        <span className="flex items-center gap-2">
          {title}
          {count > 0 && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
                color: "white",
              }}
            >
              {count}
            </span>
          )}
        </span>
        <svg
          className={cn("h-3.5 w-3.5 text-[var(--text-muted)] transition-transform duration-200", open && "rotate-180")}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && (
        <div className="mt-1 space-y-0.5 px-1 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
