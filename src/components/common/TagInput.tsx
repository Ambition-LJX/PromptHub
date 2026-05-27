"use client";

import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
}

export function TagInput({ value, onChange, label = "自定义标签" }: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = useCallback(() => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInput("");
    }
  }, [input, value, onChange]);

  const removeTag = useCallback(
    (tag: string) => {
      onChange(value.filter((v) => v !== tag));
    },
    [value, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-[var(--text-secondary)]">{label}</label>
      <div
        className="flex flex-wrap gap-1.5 p-2.5 min-h-[42px] rounded-xl border transition-all duration-200"
        style={{
          background: "var(--surface-glass)",
          borderColor: "var(--border-default)",
        }}
      >
        {value.map((tag) => (
          <Badge key={tag} variant="accent" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-0.5 rounded-full hover:opacity-70 transition-opacity p-0.5"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </Badge>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={value.length === 0 ? "输入标签后按回车添加" : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
          style={{ color: "var(--text-primary)" }}
        />
      </div>
    </div>
  );
}
