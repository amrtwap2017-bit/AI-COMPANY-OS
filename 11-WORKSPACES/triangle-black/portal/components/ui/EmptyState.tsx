"use client";
// @ts-nocheck
// Triangle Black — Empty State v2.0

import { useRouter } from "next/navigation";

interface EmptyStateProps {
  icon?:   string;
  title:   string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  secondaryAction?: { label: string; onClick?: () => void; href?: string };
  size?:   "sm" | "md" | "lg";
}

export function EmptyState({
  icon = "📭", title, description, action, secondaryAction, size = "md"
}: EmptyStateProps) {
  const router = useRouter();

  const handleAction = (a: { onClick?: () => void; href?: string }) => {
    if (a.onClick) a.onClick();
    else if (a.href) router.push(a.href);
  };

  const iconSize   = size === "sm" ? "text-4xl" : size === "lg" ? "text-7xl" : "text-5xl";
  const padding    = size === "sm" ? "py-8"     : size === "lg" ? "py-20"    : "py-12";
  const titleClass = size === "sm" ? "text-sm font-semibold" : "text-lg font-bold";

  return (
    <div className={`flex flex-col items-center justify-center text-center ${padding} px-6`}>
      <div className={`${iconSize} mb-4 opacity-50 select-none`}>{icon}</div>
      <h3 className={`${titleClass} text-primary mb-1`}>{title}</h3>
      {description && (
        <p className="text-body text-secondary max-w-sm mb-6">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {secondaryAction && (
            <button
              onClick={() => handleAction(secondaryAction)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-surface border border-border text-secondary hover:border-border-focus hover:text-primary transition-all duration-base"
            >
              {secondaryAction.label}
            </button>
          )}
          {action && (
            <button
              onClick={() => handleAction(action)}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-brand hover:bg-brand-hover text-inverse shadow-sm transition-all duration-base"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
