"use client";

import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { extractVariables } from "@/lib/utils";

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PromptEditor({ value, onChange, placeholder = "在此输入提示词内容..." }: PromptEditorProps) {
  const variables = extractVariables(value);

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[200px]"
        style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
        spellCheck={false}
      />
      {variables.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
            <svg className="h-3 w-3" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01"/></svg>
            模板变量:
          </span>
          {variables.map((v) => (
            <Badge
              key={v}
              variant="outline"
              className="text-xs font-semibold"
              style={{
                borderColor: "var(--accent)",
                color: "var(--accent)",
                background: "var(--accent-subtle)",
              }}
            >
              {"{{"} {v} {"}}"}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
