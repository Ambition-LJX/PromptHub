"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Users, Trash2, Crown, Shield } from "lucide-react";
import type { Team } from "@/types/models";
import { cn } from "@/lib/utils";

export default function TeamsPage() {
  const { user, loading: authLoading } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [addMemberEmail, setAddMemberEmail] = useState("");
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch("/api/teams");
      if (res.ok) {
        const data = await res.json();
        setTeams(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/login";
      return;
    }
    if (user) {
      fetchTeams();
    }
  }, [user, authLoading, fetchTeams]);

  const handleCreateTeam = async () => {
    if (!createForm.name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      if (res.ok) {
        setShowCreate(false);
        setCreateForm({ name: "", description: "" });
        fetchTeams();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("确定要删除这个团队吗？")) return;
    await fetch(`/api/teams/${teamId}`, { method: "DELETE" });
    fetchTeams();
  };

  const handleRemoveMember = async (teamId: string, memberUserId: string) => {
    if (!confirm("确定要移除该成员吗？")) return;
    await fetch(`/api/teams/${teamId}/members?userId=${memberUserId}`, { method: "DELETE" });
    fetchTeams();
    if (activeTeam?.id === teamId) {
      const updated = teams.find(t => t.id === teamId);
      if (updated) setActiveTeam({ ...updated, members: updated.members.filter(m => m.userId !== memberUserId) });
    }
  };

  const handleAddMember = async () => {
    if (!activeTeam || !addMemberEmail.trim()) return;
    setAddingMember(true);
    try {
      const res = await fetch(`/api/teams/${activeTeam.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addMemberEmail }),
      });
      if (res.ok) {
        setShowAddMember(false);
        setAddMemberEmail("");
        fetchTeams();
      } else {
        const data = await res.json();
        alert(data.error ?? "添加失败");
      }
    } finally {
      setAddingMember(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-[var(--text-tertiary)]">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">
            <span className="gradient-text">团队管理</span>
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
            创建和管理团队，与团队成员共享提示词和项目
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          创建团队
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-sm text-[var(--text-tertiary)]">加载中...</div>
      ) : teams.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center rounded-2xl"
          style={{ background: "var(--surface-glass)", border: "1px solid var(--border-default)" }}
        >
          <Users className="h-12 w-12 mb-4" style={{ color: "var(--accent)" }} />
          <h3 className="text-lg font-bold text-[var(--text-secondary)] mb-2">还没有团队</h3>
          <p className="text-sm text-[var(--text-muted)] mb-5">创建一个团队，开始与他人协作</p>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            创建团队
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="rounded-2xl p-5"
              style={{
                background: "var(--surface-elevated)",
                border: "1px solid var(--border-default)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--accent-subtle)" }}
                  >
                    <Users className="h-5 w-5" style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)]">{team.name}</h3>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {team.members.length} 位成员
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTeam(team.id)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {team.description && (
                <p className="text-sm text-[var(--text-tertiary)] mb-4 line-clamp-2">
                  {team.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                {team.members.slice(0, 3).map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
                    >
                      {m.user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-[var(--text-secondary)] truncate">
                      {m.user.username}
                    </span>
                    {m.role === "OWNER" && (
                      <Crown className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                ))}
                {team.members.length > 3 && (
                  <p className="text-xs text-[var(--text-muted)]">
                    +{team.members.length - 3} 位成员
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setActiveTeam(team); setShowAddMember(true); }}
                >
                  添加成员
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setActiveTeam(team)}
                >
                  查看详情
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <div className="relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ background: "var(--accent)" }} />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-10 blur-2xl" style={{ background: "var(--accent-secondary, var(--accent))" }} />
            
            <DialogHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover, var(--accent)))" }}
                >
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl">创建团队</DialogTitle>
                  <p className="text-xs text-[var(--text-tertiary)]">建立新团队，开始协作之旅</p>
                </div>
              </div>
            </DialogHeader>
          </div>
          
          <div className="space-y-5 py-4 relative">
            {/* Team Name Input */}
            <div className="group">
              <label className="text-sm font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                团队名称
                <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="例如：前端开发组"
                  className={cn(
                    "h-12 pl-11 pr-4 rounded-xl transition-all duration-200",
                    "border-2 focus:border-[var(--accent)]",
                    "bg-[var(--surface-glass)]",
                    createForm.name && "border-[var(--accent)]/50"
                  )}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Users className={cn(
                    "h-4 w-4 transition-colors duration-200",
                    createForm.name ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
                  )} />
                </div>
              </div>
              {createForm.name && (
                <p className="text-xs text-[var(--text-tertiary)] mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
                  {createForm.name.length}/30 字符
                </p>
              )}
            </div>
            
            {/* Description Input */}
            <div className="group">
              <label className="text-sm font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                团队描述
                <span className="text-xs text-[var(--text-muted)] font-normal">(可选)</span>
              </label>
              <div className="relative">
                <Textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="简单描述一下团队的职能和目标..."
                  className={cn(
                    "min-h-[100px] pl-11 pr-4 pt-3 rounded-xl resize-none transition-all duration-200",
                    "border-2 focus:border-[var(--accent)]",
                    "bg-[var(--surface-glass)]",
                    createForm.description && "border-[var(--accent)]/50"
                  )}
                />
                <div className="absolute left-4 top-3 pointer-events-none">
                  <Shield className={cn(
                    "h-4 w-4 transition-colors duration-200",
                    createForm.description ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
                  )} />
                </div>
              </div>
              {createForm.description && (
                <p className="text-xs text-[var(--text-tertiary)] mt-1.5">
                  {createForm.description.length}/200 字符
                </p>
              )}
            </div>

            {/* Quick Templates */}
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-2">快速模板</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "前端开发", icon: "💻", desc: "前端团队" },
                  { name: "后端开发", icon: "⚙️", desc: "后端团队" },
                  { name: "产品设计", icon: "🎨", desc: "设计团队" },
                  { name: "全栈开发", icon: "🚀", desc: "全栈团队" },
                ].map((template) => (
                  <button
                    key={template.name}
                    onClick={() => setCreateForm({ 
                      ...createForm, 
                      name: createForm.name || template.name,
                      description: createForm.description || template.desc
                    })}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                      "border border-[var(--border-default)]",
                      "hover:border-[var(--accent)] hover:bg-[var(--accent)]/5",
                      "text-[var(--text-secondary)]"
                    )}
                  >
                    {template.icon} {template.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCreate(false);
                setCreateForm({ name: "", description: "" });
              }}
              className="h-10 px-6 rounded-xl"
            >
              取消
            </Button>
            <Button 
              onClick={handleCreateTeam} 
              disabled={!createForm.name.trim() || creating}
              className={cn(
                "h-10 px-8 rounded-xl font-semibold transition-all duration-200",
                "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover,var(--accent))]",
                "hover:shadow-lg hover:shadow-[var(--accent)]/25",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {creating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  创建中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  创建团队
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="sm:max-w-md">
          <div className="relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full opacity-15 blur-3xl" style={{ background: "var(--accent)" }} />
            
            <DialogHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover, var(--accent)))" }}
                >
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl">添加团队成员</DialogTitle>
                  <p className="text-xs text-[var(--text-tertiary)]">邀请新成员加入 {activeTeam?.name}</p>
                </div>
              </div>
            </DialogHeader>
          </div>
          
          <div className="py-4 relative">
            <label className="text-sm font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-2">
              成员邮箱
              <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Input
                type="email"
                value={addMemberEmail}
                onChange={(e) => setAddMemberEmail(e.target.value)}
                placeholder="请输入成员的邮箱地址"
                className={cn(
                  "h-12 pl-11 pr-4 rounded-xl transition-all duration-200",
                  "border-2 focus:border-[var(--accent)]",
                  "bg-[var(--surface-glass)]",
                  addMemberEmail && "border-[var(--accent)]/50"
                )}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && addMemberEmail.trim()) {
                    handleAddMember();
                  }
                }}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg 
                  className={cn(
                    "h-4 w-4 transition-colors duration-200",
                    addMemberEmail ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
                  )} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            {/* Help text */}
            <p className="text-xs text-[var(--text-muted)] mt-3 flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              成员必须先注册才能被添加
            </p>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddMember(false);
                setAddMemberEmail("");
              }}
              className="h-10 px-6 rounded-xl"
            >
              取消
            </Button>
            <Button 
              onClick={handleAddMember} 
              disabled={!addMemberEmail.trim() || addingMember}
              className={cn(
                "h-10 px-8 rounded-xl font-semibold transition-all duration-200",
                "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover,var(--accent))]",
                "hover:shadow-lg hover:shadow-[var(--accent)]/25",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {addingMember ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  添加中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  添加成员
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
