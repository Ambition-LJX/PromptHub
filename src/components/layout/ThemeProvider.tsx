"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ThemeName, ThemeConfig } from "@/config/themes";
import { THEMES, DEFAULT_THEME } from "@/config/themes";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export { THEMES };
export type { ThemeName, ThemeConfig };

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((name: ThemeName) => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;

    THEMES.forEach((t) => html.classList.remove(`theme-${t.name}`));
    html.classList.add(`theme-${name}`);

    try {
      localStorage.setItem("prompthub-theme", name);
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeState(name);
    applyTheme(name);
  }, [applyTheme]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("prompthub-theme") as ThemeName | null;
      if (stored && THEMES.some((t) => t.name === stored)) {
        setThemeState(stored);
        applyTheme(stored);
      } else {
        applyTheme(DEFAULT_THEME);
      }
    } catch {
      applyTheme(DEFAULT_THEME);
    }
    setMounted(true);
  }, [applyTheme]);

  const themeConfig = THEMES.find((t) => t.name === theme) ?? THEMES[0];

  if (!mounted) {
    return (
      <div style={{
        background: "#060914",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }} />
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
