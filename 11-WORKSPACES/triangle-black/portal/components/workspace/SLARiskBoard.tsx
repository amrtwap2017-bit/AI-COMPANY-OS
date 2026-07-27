// @ts-nocheck
"use client";
export function SLARiskBoard({ title, subtitle, items=[] }:any) {
  const colors:any = { warning:"bg-amber-50 border-amber-200 text-amber-700", success:"bg-emerald-50 border-emerald-200 text-emerald-700", neutral:"bg-slate-50 border-slate-200 text-slate-600" };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-secondary mb-4">{subtitle}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item:any,i:number)=>(
          <div key={i} className={"rounded-xl border p-3 "+(colors[item.severity]||colors.neutral)}>
            <p className="text-xl font-bold">{item.value}</p>
            <p className="text-xs font-semibold mt-0.5">{item.title}</p>
            {item.detail && <p className="text-[10px] mt-1 opacity-75">{item.detail}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}