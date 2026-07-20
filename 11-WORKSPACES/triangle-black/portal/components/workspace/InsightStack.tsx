// @ts-nocheck
"use client";
export function InsightStack({ title, subtitle, items=[] }:any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className="space-y-3">
        {items.map((item:any,i:number)=>(
          <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
            <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              {item.detail && <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}