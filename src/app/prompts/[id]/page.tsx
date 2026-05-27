"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TagSelector } from "@/components/common/TagSelector";
import { TagInput } from "@/components/common/TagInput";
import { CopyButton } from "@/components/common/CopyButton";
import { PromptEditor } from "@/components/prompts/PromptEditor";
import { LANGUAGES, ROLES, STAGES } from "@/types";
import { formatDate } from "@/lib/utils";
import type { Prompt } from "@/types";

export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    description: "",
    language: [] as string[],
    role: [] as string[],
    stage: [] as string[],
    tags: [] as string[],
  });

  const fetchPrompt = useCallback(async () => {
    try {
      const res = await fetch(`/api/prompts/${id}`);
      if (!res.ok) {
        router.push("/prompts");
        return;
      }
      const data = await res.json();
      setPrompt(data);
      setEditForm({
        title: data.title,
        content: data.content,
        description: data.description ?? "",
        language: data.language,
        role: data.role,
        stage: data.stage,
        tags: data.tags,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchPrompt();
  }, [fetchPrompt]);

  const handleSave = async () => {
    if (!editForm.title || !editForm.content) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/prompts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditing(false);
        fetchPrompt();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!prompt) return;
    await fetch(`/api/prompts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !prompt.isFavorite }),
    });
    fetchPrompt();
  };

  const handleDelete = async () => {
    await fetch(`/api/prompts/${id}`, { method: "DELETE" });
    router.push("/prompts");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center min-h-[60vh]">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-[var(--border-default)]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent" style={{ borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
          <div className="absolute inset-1 rounded-full border-2 border-transparent" style={{ borderBottomColor: "var(--accent-hover)", animation: "spin 1.2s linear infinite reverse" }} />
        </div>
      </div>
    );
  }

  if (!prompt) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 page-enter">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/prompts"
          className="flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          返回列表
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleToggleFavorite}>
            {prompt.isFavorite ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
            )}
            {prompt.isFavorite ? "取消收藏" : "收藏"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            编辑
          </Button>
          <Button variant="ghost" size="sm" className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10" onClick={() => setShowDelete(true)}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            删除
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-black text-[var(--text-primary)] mb-2 flex items-center gap-2">
          {prompt.isFavorite && (
            <svg className="h-5 w-5 fill-[var(--accent)] text-[var(--accent)]" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
          )}
          {prompt.title}
        </h1>
        {prompt.description && (
          <p className="text-[var(--text-tertiary)]">{prompt.description}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {prompt.language.map((lang) => (
          <Badge key={lang} variant="accent" className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg> {lang}
          </Badge>
        ))}
        {prompt.role.map((role) => (
          <Badge key={role} variant="outline">{role}</Badge>
        ))}
        {prompt.stage.map((stage) => (
          <Badge key={stage} variant="subtle">
            <svg className="h-3 w-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg> {stage}
          </Badge>
        ))}
        {prompt.tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            <svg className="h-3 w-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg> {tag}
          </Badge>
        ))}
      </div>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">提示词内容</TabsTrigger>
          <TabsTrigger value="versions">版本历史 ({prompt.versions.length})</TabsTrigger>
          <TabsTrigger value="meta">元信息</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <div className="relative mt-4">
            <div className="absolute top-3 right-3 z-10">
              <CopyButton text={prompt.content} />
            </div>
            <pre
              className="w-full p-5 rounded-xl border text-sm leading-relaxed overflow-x-auto"
              style={{
                background: "var(--surface-card)",
                borderColor: "var(--border-default)",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                whiteSpace: "pre-wrap",
              }}
            >
              {prompt.content}
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="versions">
          <div className="mt-4 space-y-3">
            <div
              className="p-4 rounded-xl border"
              style={{
                background: "var(--surface-card)",
                borderColor: "var(--border-default)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge variant="default">当前版本</Badge>
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {formatDate(prompt.updatedAt)}
                </span>
              </div>
              <pre
                className="text-xs leading-relaxed"
                style={{
                  color: "var(--text-tertiary)",
                  fontFamily: "var(--font-mono, monospace)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {prompt.content.length > 300 ? prompt.content.slice(0, 300) + "..." : prompt.content}
              </pre>
            </div>
            {prompt.versions.length > 0 && prompt.versions.map((v, i) => {
              const versionNum = prompt.versions.length - i;
              return (
              <div
                key={i}
                className="p-4 rounded-xl border"
                style={{
                  background: "var(--surface-glass)",
                  borderColor: "var(--border-default)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[var(--text-muted)]">v{versionNum}</span>
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {formatDate(v.createdAt)}
                  </span>
                </div>
                <pre
                  className="text-xs leading-relaxed"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono, monospace)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {v.content.length > 300 ? v.content.slice(0, 300) + "..." : v.content}
                </pre>
              </div>
              );
            })}
            {prompt.versions.length === 0 && (
              <p className="text-sm text-[var(--text-muted)] text-center py-8">暂无版本历史</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="meta">
          <div className="mt-4 space-y-3">
            {[
              { label: "创建时间", value: formatDate(prompt.createdAt) },
              { label: "更新时间", value: formatDate(prompt.updatedAt) },
              { label: "提示词 ID", value: prompt.id, mono: true },
              { label: "内容字数", value: `${prompt.content.length} 字` },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between py-2.5"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
              >
                <span className="text-sm text-[var(--text-muted)]">{row.label}</span>
                {row.mono ? (
                  <code className="text-xs" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono, monospace)" }}>{row.value}</code>
                ) : (
                  <span className="text-sm text-[var(--text-secondary)]">{row.value}</span>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑提示词</DialogTitle>
            <DialogDescription>修改提示词内容和标签信息</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-semibold text-[var(--text-secondary)] mb-1.5 block">
                标题 <span className="text-red-400">*</span>
              </label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[var(--text-secondary)] mb-1.5 block">
                描述
              </label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="min-h-[60px]"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[var(--text-secondary)] mb-1.5 block">
                内容 <span className="text-red-400">*</span>
              </label>
              <PromptEditor
                value={editForm.content}
                onChange={(v) => setEditForm({ ...editForm, content: v })}
              />
            </div>

            <TagSelector
              label="语言标签"
              options={LANGUAGES}
              value={editForm.language}
              onChange={(v) => setEditForm({ ...editForm, language: v })}
            />

            <TagSelector
              label="角色标签"
              options={ROLES}
              value={editForm.role}
              onChange={(v) => setEditForm({ ...editForm, role: v })}
            />

            <TagSelector
              label="开发阶段"
              options={STAGES}
              value={editForm.stage}
              onChange={(v) => setEditForm({ ...editForm, stage: v })}
            />

            <TagInput
              value={editForm.tags}
              onChange={(v) => setEditForm({ ...editForm, tags: v })}
              label="自定义标签"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={!editForm.title || !editForm.content || saving}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除提示词</DialogTitle>
            <DialogDescription>
              确定要删除「{prompt.title}」吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
