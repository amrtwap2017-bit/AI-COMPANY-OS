// @ts-nocheck
import { ReactNode } from "react";

interface Breadcrumb { label: string; href?: string }

interface Props {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: "amber" | "blue" | "green" | "emerald" | "red" | "slate" | "purple";
  actions?: ReactNode;
  back?: ReactNode;
  breadcrumbs?: Breadcrumb[];
  meta?: ReactNode;
}

const badgeStyles: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber:  "bg-amber-50 text-amber-700 border-amber-200",
  blue:   "bg-blue-50 text-blue-700 border-blue-200",
  green:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  red:    "bg-red-50 text-red-700 border-red-200",
  slate:  "bg-slate-100 text-slate-600 border-slate-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
};

export function PageHeader({ title, subtitle, badge, badgeColor = "amber", actions, back, breadcrumbs, meta }: Props) {
  return (
    <div className="space-y-1 pb-5 border-b border-slate-200">
      {/* breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-slate-300 text-xs">/</span>}
              {b.href
                ? <a href={b.href} className="text-xs text-slate-400 hover:text-amber-600 transition-colors">{b.label}</a>
                : <span className="text-xs text-slate-400">{b.label}</span>
              }
            </span>
          ))}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          {back && <div className="mt-0.5 flex-shrink-0">{back}</div>}
          <div className="min-w-0">
            {/* title row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[1.375rem] font-bold text-slate-900 tracking-tight leading-tight">
                {title}
              </h1>
              {badge && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badgeStyles[badgeColor]}`}>
                  {badge}
                </span>
              )}
            </div>

            {/* subtitle */}
            {subtitle && (
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{subtitle}</p>
            )}

            {/* meta row */}
            {meta && (
              <div className="flex items-center gap-3 mt-2">
                {meta}
              </div>
            )}
          </div>
        </div>

        {/* actions */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
