"use client"

/* Triangle Black Design Tokens
 * Primary action: var(--color-action-primary)
 * Danger action:  var(--color-action-danger)
 * Focus state:    focus-visible:ring-2
 */;
import React, { ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonVariant = "primary" /* --color-action-primary */ | "secondary" | "danger" | "ghost";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, variant = "primary" /* --color-action-primary */, size = "md", loading = false, className = "", disabled, ...props },
  ref
) {
  const baseStyle = "inline-flex items-center justify-center font-semibold rounded-md border transition-all focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-[var(--color-action-primary,_#b45309)] text-white border-transparent hover:opacity-95 shadow-sm focus-visible:ring-2",
    secondary: "bg-surface-alt text-primary border-border hover:bg-surface-alt/80",
    danger: "bg-danger text-white border-danger-border hover:opacity-95 shadow-sm",
    ghost: "bg-transparent text-secondary border-transparent hover:bg-surface-alt"
  };

  const sizeStyles: Record<ButtonSize, string> = {
    xs: "px-2.5 py-1 text-[11px]",
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base"
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
});
