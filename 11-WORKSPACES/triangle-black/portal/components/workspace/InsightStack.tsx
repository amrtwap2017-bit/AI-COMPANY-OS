// @ts-nocheck
"use client";
export function InsightStack({ title, subtitle, items=[] }:any) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="font-semibold text-primary mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-secondary mb-4">{subtitle}</p>}
      <div className="space-y-3">
        {items.map((item:any,i:number)=>(
          <div key={i} className="flex gap-3 p-3 bg-base-alt rounded-xl">
            <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span>
            <div>
              <p className="text-sm font-semibold text-primary">{item.title}</p>
              {item.detail && <p className="text-xs text-secondary mt-0.5">{item.detail}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}