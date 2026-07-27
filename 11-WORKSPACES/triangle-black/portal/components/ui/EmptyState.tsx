"use client";
// @ts-nocheck
// Triangle Black — Enterprise Empty State
// Usage: <EmptyState icon="🔧" title="No Work Orders" description="..." action={{label:"Create WO", onClick:...}} />

import { useRouter } from "next/navigation";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  secondaryAction?: { label: string; onClick?: () => void; href?: string };
  size?: "sm" | "md" | "lg";
}

export function EmptyState({ icon = "📭", title, description, action, secondaryAction, size = "md" }: EmptyStateProps) {
  const router = useRouter();

  const handleAction = (a: { onClick?: () => void; href?: string }) => {
    if (a.onClick) a.onClick();
    else if (a.href) router.push(a.href);
  };

  const iconSize = size === "sm" ? "text-4xl" : size === "lg" ? "text-7xl" : "text-5xl";
  const padding  = size === "sm" ? "py-6"     : size === "lg" ? "py-16"    : "py-10";

  return (
    <div className={`flex flex-col items-center justify-center text-center ${padding} px-4`}>
      <div className={`${iconSize} mb-4 opacity-60`}>{icon}</div>
      <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{title}</h3>
      {description && (
        <p className="text-slate-500 text-sm max-w-sm mb-6">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {secondaryAction && (
            <button onClick={() => handleAction(secondaryAction)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400 transition-all">
              {secondaryAction.label}
            </button>
          )}
          {action && (
            <button onClick={() => handleAction(action)}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all">
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
