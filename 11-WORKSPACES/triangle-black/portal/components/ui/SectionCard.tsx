// @ts-nocheck
import { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  compact?: boolean;
  flush?: boolean;
  className?: string;
}

export function SectionCard({ title, subtitle, actions, children, icon, compact, flush, className }: Props) {
  return (
    <div className={`bg-surface rounded-xl border border-border shadow-sm overflow-hidden ${className ?? ""}`}>
      <div className={`flex items-center justify-between border-b border-divider ${compact ? "px-4 py-3" : "px-5 py-4"}`}>
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h3 className={`font-semibold text-primary truncate ${compact ? "text-xs" : "text-sm"}`}>
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-tertiary mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {actions}
          </div>
        )}
      </div>
      <div className={flush ? "" : compact ? "p-4" : "p-5"}>
        {children}
      </div>
    </div>
  );
}
