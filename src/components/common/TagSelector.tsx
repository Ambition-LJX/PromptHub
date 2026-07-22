"use client";

import { useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagSelectorProps {
  label: string;
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function TagSelector({ label, options, value, onChange }: TagSelectorProps) {
  const isAllSelected = useMemo(
    () => options.length > 0 && options.every((opt) => value.includes(opt)),
    [options, value]
  );

  const toggle = useCallback(
    (item: string) => {
      if (value.includes(item)) {
        onChange(value.filter((v) => v !== item));
      } else {
        onChange([...value, item]);
      }
    },
    [value, onChange]
  );

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  }, [isAllSelected, options, onChange]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-[var(--text-secondary)]">{label}</label>
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={isAllSelected ? "accent" : "outline"}
          className={cn(
            "cursor-pointer select-none transition-all duration-150 hover:scale-105",
            isAllSelected ? "" : "hover:bg-[var(--accent-muted)]"
          )}
          onClick={toggleAll}
        >
          {isAllSelected ? (
            <svg className="h-3 w-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-3 w-3 mr-0.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="5" y="5" width="14" height="14" rx="3" strokeWidth={2} />
            </svg>
          )}
          全选
        </Badge>
        {options.map((option) => {
          const isSelected = value.includes(option);
          return (
            <Badge
              key={option}
              variant={isSelected ? "accent" : "outline"}
              className="cursor-pointer select-none transition-all duration-150 hover:scale-105"
              onClick={() => toggle(option)}
            >
              {isSelected && (
                <svg className="h-3 w-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              )}
              {option}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
