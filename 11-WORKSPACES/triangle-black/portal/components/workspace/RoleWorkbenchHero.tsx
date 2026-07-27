// @ts-nocheck
"use client";
export function RoleWorkbenchHero({ eyebrow, title, subtitle, badges=[] }:any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-2">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">{eyebrow}</p>}
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="text-sm text-secondary mt-1 max-w-2xl">{subtitle}</p>}
      {badges.length>0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {badges.map((b:string)=>(
            <span key={b} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">{b}</span>
          ))}
        </div>
      )}
    </div>
  );
}