"use client";
/**
 * Triangle Black — Button Component
 * SPRINT-011: Fully semantic — no hardcoded colors
 * All variants use CSS custom properties from globals.css
 */
import { ReactNode, ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "xs" | "sm" | "md" | "lg";
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}

const VARIANT_STYLES: Record<string, React.CSSProperties> = {
  primary: {
    background: "var(--color-action-primary)",
    color: "var(--color-action-primary-text)",
    border: "1px solid var(--color-action-primary)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  },
  secondary: {
    background: "var(--color-action-secondary)",
    color: "var(--color-action-secondary-text)",
    border: "1px solid var(--color-border)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-action-ghost-text)",
    border: "1px solid transparent",
  },
  danger: {
    background: "var(--color-action-danger)",
    color: "var(--color-action-danger-text)",
    border: "1px solid var(--color-action-danger)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  },
  success: {
    background: "var(--color-success)",
    color: "#FFFFFF",
    border: "1px solid var(--color-success)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  },
};

const SIZE_CLASSES: Record<string, string> = {
  xs: "px-2.5 py-1 text-xs rounded gap-1",
  sm: "px-3 py-1.5 text-sm rounded-md gap-1.5",
  md: "px-4 py-2 text-sm rounded-md gap-2",
  lg: "px-5 py-2.5 text-base rounded-lg gap-2",
};

export function Button({
  variant = "secondary",
  size = "sm",
  icon,
  iconRight,
  loading,
  children,
  className = "",
  disabled,
  style,
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{ ...(VARIANT_STYLES as Record<string, any>)[variant], ...style }}
      className={`
        inline-flex items-center justify-center font-medium transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-1
        active:scale-[0.98]
        ${(SIZE_CLASSES as Record<string, any>)[size]} ${className}
      `}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}

      <span className="truncate">{children}</span>

      {iconRight && !loading && (
        <span className="flex-shrink-0">{iconRight}</span>
      )}
    </button>
  );
}
