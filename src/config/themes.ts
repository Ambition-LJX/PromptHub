export type ThemeName =
  | "deep-space"
  | "aurora-light"
  | "rose"
  | "emerald"
  | "sunset"
  | "cyber"
  | "arctic"
  | "lavender"
  | "mint"
  | "golden"
  | "midnight";

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  labelZh: string;
  emoji: string;
  isDark: boolean;
}

export const THEMES: ThemeConfig[] = [
  { name: "deep-space", label: "Deep Space", labelZh: "深邃星空", emoji: "\u2728", isDark: true },
  { name: "aurora-light", label: "Aurora Light", labelZh: "极光晨曦", emoji: "\u2600\uFE0F", isDark: false },
  { name: "rose", label: "Rose Quartz", labelZh: "玫瑰石英", emoji: "\uD83C\uDF38", isDark: true },
  { name: "emerald", label: "Emerald Forest", labelZh: "翡翠森林", emoji: "\uD83C\uDF32", isDark: true },
  { name: "sunset", label: "Sunset Orange", labelZh: "落日晚霞", emoji: "\uD83C\uDF05", isDark: true },
  { name: "cyber", label: "Cyberpunk", labelZh: "赛博朋克", emoji: "\uD83D\uDEC1", isDark: true },
  { name: "arctic", label: "Arctic Blue", labelZh: "极地蓝冰", emoji: "\u2744\uFE0F", isDark: false },
  { name: "lavender", label: "Lavender Dream", labelZh: "薰衣草梦", emoji: "\uD83C\uDF7C", isDark: true },
  { name: "mint", label: "Mint Fresh", labelZh: "薄荷清新", emoji: "\uD83C\uDF4F", isDark: false },
  { name: "golden", label: "Golden Hour", labelZh: "黄金时刻", emoji: "\uD83C\uDF1F", isDark: true },
  { name: "midnight", label: "Midnight Purple", labelZh: "午夜紫罗兰", emoji: "\uD83C\uDF0C", isDark: true },
];

export const STORAGE_KEY_THEME = "prompthub-theme";
export const DEFAULT_THEME: ThemeName = "deep-space";

export function getThemeColors(name: string): string[] {
  const colorMap: Record<string, string[]> = {
    "deep-space": ["#6366f1", "#818cf8", "#060914"],
    "aurora-light": ["#6366f1", "#a5b4fc", "#eef2ff"],
    "rose": ["#f43f5e", "#fb7185", "#0c0a14"],
    "emerald": ["#10b981", "#34d399", "#052e16"],
    "sunset": ["#f97316", "#fb923c", "#1c0a00"],
    "cyber": ["#06b6d4", "#22d3ee", "#030712"],
    "arctic": ["#0284c7", "#0ea5e9", "#f0f9ff"],
    "lavender": ["#a855f7", "#c084fc", "#0f0518"],
    "mint": ["#059669", "#10b981", "#f0fdf4"],
    "golden": ["#eab308", "#facc15", "#1c1400"],
    "midnight": ["#d946ef", "#e879f9", "#0a0014"],
  };
  return colorMap[name] || ["#6366f1", "#818cf8", "#060914"];
}
