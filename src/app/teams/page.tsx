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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建团队</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-semibold text-[var(--text-secondary)] mb-1.5 block">
                团队名称
              </label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="例如：前端开发组"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--text-secondary)] mb-1.5 block">
                描述（可选）
              </label>
              <Textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="团队简介..."
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>取消</Button>
            <Button onClick={handleCreateTeam} disabled={!createForm.name.trim() || creating}>
              {creating ? "创建中..." : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加团队成员</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <label className="text-sm font-semibold text-[var(--text-secondary)] mb-1.5 block">
              成员邮箱
            </label>
            <Input
              type="email"
              value={addMemberEmail}
              onChange={(e) => setAddMemberEmail(e.target.value)}
              placeholder="member@example.com"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMember(false)}>取消</Button>
            <Button onClick={handleAddMember} disabled={!addMemberEmail.trim() || addingMember}>
              {addingMember ? "添加中..." : "添加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
