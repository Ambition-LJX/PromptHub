"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTheme, THEMES } from "@/components/layout/ThemeProvider";
import { useAuth } from "@/components/layout/AuthProvider";
import { getThemeColors } from "@/config/themes";

const navItems = [
  {
    href: "/",
    label: "提示词库",
    icon: (
      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    href: "/prompts",
    label: "管理",
    icon: (
      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    href: "/projects",
    label: "项目模板",
    icon: (
      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    href: "/workspaces",
    label: "工作集",
    icon: (
      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    href: "/teams",
    label: "团队",
    icon: (
      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    href: "/favorites",
    label: "收藏",
    icon: (
      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
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
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
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

          <nav className="flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => {
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
                  {item.icon}
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
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
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
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      我的收藏
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors hover:bg-[var(--accent-subtle)]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
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
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
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
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: "1px solid var(--border-default)" }}
                >
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      更换主题
                    </span>
                  </div>
                  <button
                    onClick={() => setShowThemePicker(false)}
                    className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-muted)] transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

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
                          <svg className="h-3.5 w-3.5 text-[var(--accent)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
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
