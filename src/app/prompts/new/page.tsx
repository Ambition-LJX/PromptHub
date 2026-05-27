"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagSelector } from "@/components/common/TagSelector";
import { TagInput } from "@/components/common/TagInput";
import { PromptEditor } from "@/components/prompts/PromptEditor";
import { LANGUAGES, ROLES, STAGES } from "@/types";
import { cn } from "@/lib/utils";

const STEPS = [
  { num: 1, label: "基本信息" },
  { num: 2, label: "内容编辑" },
  { num: 3, label: "标签分类" },
];

export default function NewPromptPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    description: "",
    language: [] as string[],
    role: [] as string[],
    stage: [] as string[],
    tags: [] as string[],
  });

  const handleSubmit = async () => {
    if (!form.title || !form.content) return;
    setSaving(true);
    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const prompt = await res.json();
        router.push(`/prompts/${prompt.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const canProceedStep1 = form.title.trim().length > 0;
  const canSubmit = form.title.trim().length > 0 && form.content.trim().length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 page-enter">
      {/* Back navigation */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/prompts"
          className="flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          返回
        </Link>
        <span style={{ color: "var(--border-default)" }}>|</span>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">新建提示词</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300",
                step > s.num
                  ? "text-white"
                  : step === s.num
                  ? "text-white"
                  : "text-[var(--text-muted)]"
              )}
              style={
                step >= s.num
                  ? {
                      background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
                      boxShadow: "0 0 15px var(--accent-glow)",
                    }
                  : {
                      background: "var(--surface-glass)",
                      border: "1px solid var(--border-default)",
                    }
              }
            >
              {step > s.num ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
              ) : s.num}
            </div>
            <span
              className="ml-2 text-sm font-semibold"
              style={{ color: step >= s.num ? "var(--text-primary)" : "var(--text-muted)" }}
            >
              {s.label}
            </span>
            {idx < STEPS.length - 1 && (
              <div
                className="w-12 h-0.5 mx-3 rounded-full transition-colors duration-300"
                style={{
                  background: step > s.num ? "var(--accent)" : "var(--border-default)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <label className="text-sm font-semibold text-[var(--text-secondary)] mb-2 block">
              标题 <span className="text-red-400">*</span>
            </label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="例如：TypeScript 代码审查提示词"
              className="text-base"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-[var(--text-secondary)] mb-2 block">
              描述
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="简短描述这个提示词的用途和场景..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
              下一步
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <label className="text-sm font-semibold text-[var(--text-secondary)] mb-2 block">
              提示词内容 <span className="text-red-400">*</span>
            </label>
            <PromptEditor
              value={form.content}
              onChange={(v) => setForm({ ...form, content: v })}
              placeholder={`请输入提示词内容。\n\n可以使用 {{变量名}} 格式定义模板变量。`}
            />
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              上一步
            </Button>
            <Button onClick={() => setStep(3)} disabled={!form.content.trim()}>
              下一步
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-fade-in">
          <TagSelector
            label="语言标签"
            options={LANGUAGES}
            value={form.language}
            onChange={(v) => setForm({ ...form, language: v })}
          />

          <TagSelector
            label="角色标签"
            options={ROLES}
            value={form.role}
            onChange={(v) => setForm({ ...form, role: v })}
          />

          <TagSelector
            label="开发阶段"
            options={STAGES}
            value={form.stage}
            onChange={(v) => setForm({ ...form, stage: v })}
          />

          <TagInput
            value={form.tags}
            onChange={(v) => setForm({ ...form, tags: v })}
            label="自定义标签"
          />

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(2)}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              上一步
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit || saving}>
              {saving ? "创建中..." : "创建提示词"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
