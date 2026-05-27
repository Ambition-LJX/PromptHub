"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTheme, THEMES } from "@/components/layout/ThemeProvider";
import { useAuth } from "@/components/layout/AuthProvider";
import { getThemeColors } from "@/config/themes";
import { BookOpen, FolderKanban, Layers, Sparkles, Palette, X, Check, LogOut, User, ChevronDown, Users, Heart } from "lucide-react";

const navItems = [
  { href: "/", label: "提示词库", icon: Sparkles },
  { href: "/prompts", label: "管理", icon: BookOpen },
  { href: "/projects", label: "项目模板", icon: FolderKanban },
  { href: "/workspaces", label: "工作集", icon: Layers },
  { href: "/teams", label: "团队", icon: Users },
  { href: "/favorites", label: "收藏", icon: Heart },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowThemePicker(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowThemePicker(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="glass-header sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-base group flex-shrink-0"
          >
            <div
              className="relative flex items-center justify-center w-8 h-8 rounded-lg accent-glow"
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
              }}
            >
              <BookOpen className="h-4 w-4 text-white" />
              <div
                className="absolute inset-0 rounded-lg opacity-50 group-hover:opacity-80 transition-opacity"
                style={{
                  background: "linear-gradient(135deg, var(--accent), transparent)",
                  filter: "blur(8px)",
                }}
              />
            </div>
            <span
              className="gradient-text hidden sm:inline"
              style={{ letterSpacing: "-0.02em" }}
            >
              PromptHub
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:inline">{item.label}</span>
                  {isActive && (
                    <span className="absolute inset-0 rounded-lg" style={{
                      background: "var(--accent-subtle)",
                      border: "1px solid var(--border-default)",
                    }} />
                  )}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full" style={{
                      background: "linear-gradient(90deg, var(--accent), var(--accent-hover))",
                    }} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right section: User menu or Login */}
          {user ? (
            <div className="relative flex-shrink-0" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                  "hover:bg-[var(--accent-subtle)]"
                )}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{user.username}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 animate-fade-in-scale"
                  style={{
                    background: "var(--surface-elevated)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "var(--shadow-lg)",
                    zIndex: 100,
                  }}
                >
                  <div
                    className="px-4 py-3"
                    style={{ borderBottom: "1px solid var(--border-default)" }}
                  >
                    <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {user.username}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                      {user.email}
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => { router.push("/favorites"); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors hover:bg-[var(--accent-subtle)]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Heart className="h-4 w-4" />
                      我的收藏
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors hover:bg-[var(--accent-subtle)]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <LogOut className="h-4 w-4" />
                      退出登录
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-subtle)]"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 text-white"
                style={{ background: "var(--accent)" }}
              >
                注册
              </Link>
            </div>
          )}

          {/* Theme Picker */}
          <div className="relative flex-shrink-0" ref={pickerRef}>
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                "hover:bg-[var(--accent-subtle)]"
              )}
              title="更换主题"
            >
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">主题</span>
            </button>

            {showThemePicker && (
              <div
                className="absolute right-0 top-full mt-2 w-72 animate-fade-in-scale"
                style={{
                  background: "var(--surface-elevated)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 100,
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: "1px solid var(--border-default)" }}
                >
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-[var(--accent)]" />
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      更换主题
                    </span>
                  </div>
                  <button
                    onClick={() => setShowThemePicker(false)}
                    className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-muted)] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Theme Grid */}
                <div className="p-3 grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                  {THEMES.map((t) => {
                    const isSelected = theme === t.name;
                    return (
                      <button
                        key={t.name}
                        onClick={() => {
                          setTheme(t.name);
                          setShowThemePicker(false);
                        }}
                        className={cn(
                          "relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200",
                          "border",
                          isSelected
                            ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
                            : "border-[var(--border-default)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-glass)]"
                        )}
                      >
                        {/* Color preview dots */}
                        <div className="flex -space-x-1 flex-shrink-0">
                          {getThemeColors(t.name).map((color, i) => (
                            <span
                              key={i}
                              className="w-4 h-4 rounded-full border border-black/20"
                              style={{ background: color }}
                            />
                          ))}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-[var(--text-primary)] truncate">
                            {t.labelZh}
                          </div>
                          <div className="text-[10px] text-[var(--text-tertiary)] truncate">
                            {t.label}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-[var(--accent)] flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
