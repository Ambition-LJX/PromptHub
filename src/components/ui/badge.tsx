"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "accent" | "subtle";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200",
        {
          // Default — accent gradient fill
          "bg-[linear-gradient(135deg,var(--accent),var(--accent-hover))] text-white shadow-sm":
            variant === "default",

          // Secondary — muted surface
          "bg-[var(--surface-glass)] text-[var(--text-secondary)] border border-[var(--border-default)]":
            variant === "secondary",

          // Outline — border only
          "border border-[var(--border-default)] text-[var(--text-tertiary)] bg-transparent":
            variant === "outline",

          // Destructive
          "bg-red-500/20 text-red-400 border border-red-500/30":
            variant === "destructive",

          // Accent — bright accent bg
          "bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--border-default)]":
            variant === "accent",

          // Subtle — very light
          "bg-[var(--accent-muted)] text-[var(--text-tertiary)]":
            variant === "subtle",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
