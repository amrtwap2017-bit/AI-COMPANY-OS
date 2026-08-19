"use client";
// @ts-nocheck
// Triangle Black — Page Header v2.0
// Standard header for every page — domain badge + title + actions
import { useRouter } from "next/navigation";

const DOMAIN_COLORS: Record<string, string> = {
  "Operations":     "text-orange-500",
  "Maintenance":    "text-red-500",
  "Commercial":     "text-amber-500",
  "Finance":        "text-emerald-500",
  "Supply Chain":   "text-yellow-500",
  "Executive":      "text-purple-500",
  "Analytics":      "text-cyan-500",
  "Engineering":    "text-blue-500",
  "Projects":       "text-indigo-500",
  "Administration": "text-tertiary",
  "Platform":       "text-brand",
  "AI":             "text-brand-mid",
};

interface PageHeaderProps {
  domain?:    string;
  title:      string;
  description?: string;
  action?:    { label: string; onClick?: () => void; href?: string; icon?: string };
  secondaryAction?: { label: string; onClick?: () => void; href?: string };
  badge?:     { label: string; color?: "emerald" | "amber" | "red" | "blue" | "purple" | "slate" };
  breadcrumb?: { label: string; href: string }[];
  metric?:    { value: string | number; label: string; color?: string };
}

const BADGE_CLS: Record<string, string> = {
  emerald: "bg-success-bg text-success-text border-success-border",
  amber:   "bg-warning-bg text-warning-text border-warning-border",
  red:     "bg-danger-bg text-danger-text border-danger-border",
  blue:    "bg-info-bg text-info-text border-info-border",
  purple:  "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  slate:   "bg-base-alt text-secondary border-border",
};

export function PageHeader({
  domain, title, description, action, secondaryAction, badge, breadcrumb, metric
}: PageHeaderProps) {
  const router = useRouter();
  const domainColor = domain ? ((DOMAIN_COLORS as Record<string, any>)[domain] || "text-brand") : "text-brand";

  const handleAction = (a: { onClick?: () => void; href?: string }) => {
    if (a.onClick) a.onClick();
    else if (a.href) router.push(a.href);
  };

  return (
    <div className="mb-0">
      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3 text-2xs text-tertiary">
          {breadcrumb.map((crumb: any, i: any) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-tertiary">/</span>}
              <button
                onClick={() => router.push(crumb.href)}
                className="hover:text-brand transition-colors duration-fast"
              >
                {crumb.label}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Main header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Domain label */}
          {domain && (
            <div className={`text-2xs font-bold uppercase tracking-widest mb-1.5 ${domainColor}`}>
              {domain}
            </div>
          )}

          {/* Title + badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-page-title text-primary">{title}</h1>
            {badge && (
              <span className={`text-2xs font-bold px-2.5 py-1 rounded-md border ${BADGE_CLS[badge.color || "slate"]}`}>
                {badge.label}
              </span>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="text-body text-secondary mt-1.5">{description}</p>
          )}
        </div>

        {/* Metric hero (optional — for collection rate, twin score, etc.) */}
        {metric && (
          <div className={`border rounded-2xl px-5 py-3 text-center flex-shrink-0 ${metric.color || "bg-success-bg border-success-border"}`}>
            <div className="text-3xl font-black text-primary">{metric.value}</div>
            <div className="text-2xs text-secondary mt-0.5">{metric.label}</div>
          </div>
        )}

        {/* Action buttons */}
        {(action || secondaryAction) && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {secondaryAction && (
              <button
                onClick={() => handleAction(secondaryAction)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-surface border border-border text-secondary hover:border-border-focus hover:text-primary transition-all duration-base"
              >
                {secondaryAction.label}
              </button>
            )}
            {action && (
              <button
                onClick={() => handleAction(action)}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-brand hover:bg-brand-hover text-inverse shadow-sm hover:shadow-md transition-all duration-base"
              >
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
