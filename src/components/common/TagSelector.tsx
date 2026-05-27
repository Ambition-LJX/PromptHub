"use client";

import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";

interface TagSelectorProps {
  label: string;
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function TagSelector({ label, options, value, onChange }: TagSelectorProps) {
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

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-[var(--text-secondary)]">{label}</label>
      <div className="flex flex-wrap gap-2">
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
