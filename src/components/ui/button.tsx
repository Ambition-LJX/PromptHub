"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "accent";
  size?: "sm" | "md" | "lg" | "icon" | "xs";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "active:scale-[0.97]",
          // Variants
          {
            // Accent gradient — default primary action
            "text-white shadow-md hover:shadow-lg hover:shadow-[var(--accent-glow)]":
              variant === "default",
            "bg-[linear-gradient(135deg,var(--accent),var(--accent-hover))] hover:bg-[linear-gradient(135deg,var(--accent-hover),var(--accent))]":
              variant === "default",

            // Outline — glass-like outline
            "border border-[var(--border-default)] bg-transparent hover:bg-[var(--accent-subtle)] hover:border-[var(--border-strong)] text-[var(--text-primary)] hover:text-[var(--accent)]":
              variant === "outline",

            // Ghost — subtle hover
            "bg-transparent hover:bg-[var(--accent-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]":
              variant === "ghost",

            // Destructive — danger
            "bg-red-500/90 text-white hover:bg-red-500 shadow-md hover:shadow-lg hover:shadow-red-500/25":
              variant === "destructive",

            // Accent glow — for special CTA
            "text-white accent-glow bg-[linear-gradient(135deg,var(--accent),var(--accent-hover))] hover:bg-[linear-gradient(135deg,var(--accent-hover),var(--accent))]":
              variant === "accent",
          },
          // Sizes
          {
            "h-7 px-2.5 text-xs rounded-md": size === "xs",
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base rounded-xl": size === "lg",
            "h-10 w-10 p-0 rounded-lg": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
