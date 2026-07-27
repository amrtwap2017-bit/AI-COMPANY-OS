"use client";
// @ts-nocheck
// Triangle Black — Universal Page Header
// Usage: <PageHeader domain="Operations" title="Work Orders" description="..." action={{label:"New WO", onClick:...}} />

import { useRouter } from "next/navigation";

interface PageHeaderProps {
  domain?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string; icon?: string };
  secondaryAction?: { label: string; onClick?: () => void; href?: string };
  badge?: { label: string; color?: "emerald" | "amber" | "red" | "blue" | "purple" };
  breadcrumb?: { label: string; href: string }[];
}

const DOMAIN_COLORS: Record<string, string> = {
  "Operations":    "text-orange-500",
  "Maintenance":   "text-red-500",
  "Commercial":    "text-amber-500",
  "Finance":       "text-emerald-500",
  "Supply Chain":  "text-yellow-500",
  "Executive":     "text-purple-500",
  "Analytics":     "text-cyan-500",
  "Engineering":   "text-blue-500",
  "Projects":      "text-indigo-500",
  "Administration":"text-slate-400",
  "Platform":      "text-amber-400",
};

export function PageHeader({ domain, title, description, action, secondaryAction, badge, breadcrumb }: PageHeaderProps) {
  const router = useRouter();
  const domainColor = domain ? (DOMAIN_COLORS[domain] || "text-amber-500") : "text-amber-500";

  const handleAction = (a: { onClick?: () => void; href?: string }) => {
    if (a.onClick) a.onClick();
    else if (a.href) router.push(a.href);
  };

  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3 text-xs text-slate-400">
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-slate-600">/</span>}
              <button onClick={() => router.push(crumb.href)}
                className="hover:text-amber-500 transition-colors">{crumb.label}</button>
            </span>
          ))}
        </div>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Domain label */}
          {domain && (
            <div className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${domainColor}`}>
              {domain}
            </div>
          )}

          {/* Title + badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">{title}</h1>
            {badge && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                badge.color === "emerald" ? "bg-emerald-100 text-emerald-700" :
                badge.color === "red"     ? "bg-red-100 text-red-700" :
                badge.color === "blue"    ? "bg-blue-100 text-blue-700" :
                badge.color === "purple"  ? "bg-purple-100 text-purple-700" :
                "bg-amber-100 text-amber-700"
              }`}>{badge.label}</span>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="text-slate-500 text-sm mt-1.5">{description}</p>
          )}
        </div>

        {/* Action buttons */}
        {(action || secondaryAction) && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {secondaryAction && (
              <button onClick={() => handleAction(secondaryAction)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400 transition-all">
                {secondaryAction.label}
              </button>
            )}
            {action && (
              <button onClick={() => handleAction(action)}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow-md transition-all">
                {action.icon && <span className="mr-1.5">{action.icon}</span>}
                {action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
