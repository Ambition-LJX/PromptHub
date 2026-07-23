"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StageTimeline } from "@/components/projects/StageTimeline";
import { CopyButton } from "@/components/common/CopyButton";
import { formatDate, cn } from "@/lib/utils";
import type { ProjectTemplate } from "@/types";

const DEFAULT_STAGES = [
  "需求分析", "技术选型", "架构设计", "数据库设计",
  "API开发", "前端开发", "测试验证", "部署上线",
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectTemplate | null>(null);
  const [createForm, setCreateForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"list" | "detail">("list");
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async () => {
    if (!createForm.name) return;
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      if (res.ok) {
        setShowCreate(false);
        setCreateForm({ name: "", description: "" });
        fetchProjects();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除此项目模板吗？")) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 2500);
      setView("list");
      setSelectedProject(null);
      fetchProjects();
    }
  };

  const generatePromptChain = async (projectId: string) => {
    const res = await fetch(`/api/projects/${projectId}/chain`);
    const data = await res.json();
    if (!data || !data.project || !data.stagePrompts) return;

    let markdown = `# ${data.project.name}\n\n`;
    if (data.project.description) {
      markdown += `${data.project.description}\n\n`;
    }

    data.stagePrompts.forEach((sp: { stage: { name: string }; prompts: { title: string; content: string }[] }) => {
      markdown += `## ${sp.stage.name}\n\n`;
      if (sp.prompts.length === 0) {
        markdown += `*暂无关联提示词*\n\n`;
      } else {
        sp.prompts.forEach((p) => {
          markdown += `### ${p.title}\n\n`;
          markdown += `\`\`\`\n${p.content}\n\`\`\`\n\n`;
        });
      }
    });

    return markdown;
  };

  const copyProjectChain = async () => {
    if (!selectedProject) return;
    const md = await generatePromptChain(selectedProject.id);
    if (md) {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const refreshSelectedProject = async () => {
    if (!selectedProject) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`);
      if (res.ok) {
        const updated = await res.json();
        setSelectedProject(updated);
        fetchProjects();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (view === "detail" && selectedProject) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 page-enter">
        {/* Back + actions bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
          >
            <svg className="h-4 w-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            返回项目列表
          </button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyProjectChain}>
              {copied ? (
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4" style={{ color: "#86efac" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  已复制!
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  复制完整提示词链
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-red-500/10"
              style={{ color: "#f87171" }}
              onClick={() => handleDelete(selectedProject.id)}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Project header card */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9" />
                  <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                  <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
                  {selectedProject.name}
                </h1>
                {selectedProject.description && (
                  <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {selectedProject.description}
                  </p>
                )}
              </div>
            </div>
            <Badge
              variant="outline"
              className="shrink-0"
              style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
            >
              {selectedProject.stages.length} 阶段
            </Badge>
          </div>
          <div className="flex items-center gap-5 text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              创建于 {formatDate(selectedProject.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {selectedProject.stages.length} 个阶段
            </span>
          </div>

          {/* Stage progress bar */}
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>完成进度</span>
              <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>
                {selectedProject.stages.filter(s => s.promptIds && s.promptIds.length > 0).length} / {selectedProject.stages.length} 阶段已配置
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border-subtle)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(selectedProject.stages.filter(s => s.promptIds && s.promptIds.length > 0).length / Math.max(selectedProject.stages.length, 1)) * 100}%`,
                  background: "linear-gradient(90deg, var(--accent), var(--accent-hover))",
                }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline">
              <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              阶段时间轴
            </TabsTrigger>
            <TabsTrigger value="preview">
              <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              完整提示词链
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-5">
            <StageTimeline stages={selectedProject.stages} onStageUpdate={refreshSelectedProject} />
          </TabsContent>

          <TabsContent value="preview" className="mt-5">
            <ProjectChainPreview projectId={selectedProject.id} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 page-enter">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-1">
          <div>
            <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
              <span className="gradient-text">项目模板</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
              {loading ? "加载中..." : `${projects.length} 个项目模板，按开发阶段组织提示词`}
            </p>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            size="sm"
            className="shrink-0"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新建项目模板
          </Button>
        </div>

        {/* Delete success toast */}
        {deleteSuccess && (
          <div
            className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold animate-in slide-in-from-top-2"
            style={{
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              color: "#86efac",
            }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            项目模板已删除
          </div>
        )}

        {/* Quick stats */}
        {!loading && projects.length > 0 && (
          <div className="flex items-center gap-3 mt-4">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: "var(--accent-subtle)", border: "1px solid var(--border-subtle)", color: "var(--accent)" }}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {projects.length} 个项目
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: "var(--surface-glass)", border: "1px solid var(--border-subtle)", color: "var(--text-tertiary)" }}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {projects.reduce((sum, p) => sum + p.stages.length, 0)} 个阶段
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: "var(--border-default)" }} />
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{ borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }}
            />
            <div
              className="absolute inset-2 rounded-full border-2 border-transparent"
              style={{ borderBottomColor: "var(--accent-hover)", animation: "spin 1.2s linear infinite reverse" }}
            />
          </div>
        </div>
      ) : projects.length === 0 ? (
        <EmptyState onCreate={() => setShowCreate(true)} />
      ) : (
        <div className="space-y-3">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              onClick={() => { setSelectedProject(project); setView("detail"); }}
            />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <CreateProjectDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        createForm={createForm}
        setCreateForm={setCreateForm}
        onCreate={handleCreate}
        creating={creating}
      />
    </div>
  );
}

type CreateProjectDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  createForm: { name: string; description: string };
  setCreateForm: React.Dispatch<React.SetStateAction<{ name: string; description: string }>>;
  onCreate: () => void;
  creating: boolean;
};

function CreateProjectDialog({ open, onOpenChange, createForm, setCreateForm, onCreate, creating }: CreateProjectDialogProps) {
  const canSubmit = createForm.name.trim();

  useEffect(() => {
    if (!open) {
      setCreateForm({ name: "", description: "" });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onCreate();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCreate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {/* Accent top bar */}
        <div
          className="h-[3px] w-full rounded-b"
          style={{
            background: "linear-gradient(90deg, var(--accent) 0%, var(--accent-hover) 50%, var(--accent) 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 3s ease-in-out infinite",
          }}
        />

        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
                  boxShadow: "0 4px 14px var(--accent-glow)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4v16m8-8H4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <DialogTitle className="text-[1.05rem] font-bold">新建项目模板</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  创建一个新的项目模板，将自动包含 8 个标准开发阶段
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[60vh]">

          {/* Section 1: Basic Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "var(--accent-subtle)" }}>
                <span className="text-[10px] font-black" style={{ color: "var(--accent)" }}>1</span>
              </div>
              <span className="text-xs font-bold tracking-wide uppercase" style={{ color: "var(--text-tertiary)" }}>基本信息</span>
            </div>
            <div className="space-y-3 pl-7">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                  模板名称 <span style={{ color: "#f87171" }}>*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <Input
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="例如：全栈 Web 开发标准流程"
                    className="pl-9 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>描述</label>
                <Textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="简短描述这个模板的用途..."
                  className="min-h-[60px] text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="pl-7">
            <div className="h-px" style={{ background: "var(--border-subtle)" }} />
          </div>

          {/* Section 2: Stage Preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "var(--accent-subtle)" }}>
                <span className="text-[10px] font-black" style={{ color: "var(--accent)" }}>2</span>
              </div>
              <span className="text-xs font-bold tracking-wide uppercase" style={{ color: "var(--text-tertiary)" }}>阶段预览</span>
            </div>
            <div className="pl-7">
              <div className="rounded-xl p-4" style={{ background: "var(--surface-glass)", border: "1px solid var(--border-subtle)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>
                    将包含以下 {DEFAULT_STAGES.length} 个阶段
                  </p>
                  <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
                    {DEFAULT_STAGES.length} 阶段
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_STAGES.map((stage, i) => (
                    <span
                      key={stage}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: "var(--surface-elevated)",
                        border: "1px solid var(--border-default)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                        style={{ background: "var(--accent)", color: "white" }}
                      >
                        {i + 1}
                      </span>
                      {stage}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter style={{ borderTop: "1px solid var(--border-subtle)", padding: "16px 24px", background: "var(--surface-glass)" }}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
              <kbd className="px-1.5 py-0.5 rounded border text-[10px] font-mono" style={{ borderColor: "var(--border-default)", background: "var(--surface-elevated)" }}>
                Ctrl
              </kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 rounded border text-[10px] font-mono" style={{ borderColor: "var(--border-default)", background: "var(--surface-elevated)" }}>
                Enter
              </kbd>
              <span className="ml-1">快速创建</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button
                onClick={onCreate}
                disabled={!canSubmit || creating}
                size="sm"
                className="min-w-[110px]"
              >
                {creating ? (
                  <span className="flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                    </svg>
                    创建中...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    创建模板
                  </span>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProjectCard({
  project,
  index,
  onClick,
}: {
  project: ProjectTemplate;
  index: number;
  onClick: () => void;
}) {
  const completedStages = project.stages.filter(s => s.promptIds && s.promptIds.length > 0).length;
  const progress = (completedStages / Math.max(project.stages.length, 1)) * 100;

  return (
    <div
      className="glass-card group cursor-pointer"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--accent-subtle), var(--accent-muted))",
                border: "1px solid var(--border-default)",
              }}
            >
              <svg className="h-6 w-6" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3
                className="font-bold truncate transition-colors"
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              >
                {project.name}
              </h3>
              <p className="text-sm truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                {project.description || "暂无描述"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>
                {completedStages}/{project.stages.length} 阶段
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {formatDate(project.createdAt)}
              </p>
            </div>
            <svg
              className="h-5 w-5 transition-all group-hover:translate-x-1"
              style={{ color: "var(--text-muted)" }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>配置进度</span>
            <span className="text-xs font-semibold" style={{ color: progress === 100 ? "#86efac" : "var(--accent)" }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-subtle)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: progress === 100
                  ? "linear-gradient(90deg, #22c55e, #34d399)"
                  : "linear-gradient(90deg, var(--accent), var(--accent-hover))",
              }}
            />
          </div>
          <div className="flex gap-1 mt-2">
            {project.stages.map((stage, i) => (
              <div
                key={stage.id}
                className="h-1.5 flex-1 rounded-full transition-all duration-300"
                style={{
                  background: stage.promptIds && stage.promptIds.length > 0
                    ? "var(--accent)"
                    : "var(--border-subtle)",
                  opacity: stage.promptIds && stage.promptIds.length > 0 ? 1 : 0.4,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 rounded-3xl text-center relative overflow-hidden"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-default)",
      }}
    >
      {/* Decorative orb */}
      <div
        aria-hidden="true"
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--accent-subtle), transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      <div className="relative">
        {/* Animated illustration */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: "var(--accent-subtle)",
              border: "1px solid var(--border-default)",
              animation: "floatA 6s ease-in-out infinite",
            }}
          />
          <div
            className="absolute inset-2 rounded-xl flex items-center justify-center"
            style={{
              background: "var(--surface-glass)",
              border: "1px solid var(--border-subtle)",
              animation: "floatB 6s ease-in-out infinite 1s",
            }}
          />
          <div
            className="absolute inset-4 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
              animation: "floatC 6s ease-in-out infinite 2s",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 4v16m8-8H4" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          {/* Floating badge */}
          <div
            className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
            style={{
              background: "var(--accent)",
              color: "white",
              boxShadow: "0 0 10px var(--accent-glow)",
              animation: "floatB 4s ease-in-out infinite 0.5s",
            }}
          >
            8
          </div>
        </div>

        <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-secondary)" }}>
          还没有项目模板
        </h3>
        <p className="text-sm max-w-xs mx-auto mb-6" style={{ color: "var(--text-muted)" }}>
          创建项目模板，将 AI 提示词按开发阶段有序组织，实现自动化流水线
        </p>
        <Button onClick={onCreate}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          创建第一个模板
        </Button>
      </div>
    </div>
  );
}

function ProjectChainPreview({ projectId }: { projectId: string }) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/projects/${projectId}/chain`);
      const data = await res.json();
      if (!data || !data.project) {
        setLoading(false);
        return;
      }

      let md = `# ${data.project.name}\n\n`;
      if (data.project.description) {
        md += `${data.project.description}\n\n`;
      }

      data.stagePrompts.forEach((sp: { stage: { name: string }; prompts: { title: string; content: string }[] }) => {
        md += `## ${sp.stage.name}\n\n`;
        if (sp.prompts.length === 0) {
          md += `*暂无关联提示词*\n\n`;
        } else {
          sp.prompts.forEach((p) => {
            md += `### ${p.title}\n\n`;
            md += `\`\`\`\n${p.content}\n\`\`\`\n\n`;
          });
        }
      });

      setContent(md);
      setLoading(false);
    };
    load();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none"
          style={{ animation: "spin 0.8s linear infinite", color: "var(--accent)" }}
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-3 right-3 z-10">
        <CopyButton text={content} />
      </div>
      <pre
        className="w-full p-5 rounded-xl border text-sm leading-relaxed overflow-x-auto max-h-[600px] overflow-y-auto"
        style={{
          background: "var(--surface-card)",
          borderColor: "var(--border-default)",
          color: "var(--text-secondary)",
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          whiteSpace: "pre-wrap",
        }}
      >
        {content || "暂无内容"}
      </pre>
    </div>
  );
}
