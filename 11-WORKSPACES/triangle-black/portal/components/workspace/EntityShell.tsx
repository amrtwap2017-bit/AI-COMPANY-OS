// @ts-nocheck
"use client";
export function EntityShell({ title, badge, children, actions }:any) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {badge && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">{badge}</span>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}