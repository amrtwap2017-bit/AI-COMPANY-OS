// @ts-nocheck
"use client";
export function QueueBoard({ title, subtitle, columns=[] }:any) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="font-semibold text-primary mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-secondary mb-4">{subtitle}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {columns.map((col:any,i:number)=>(
          <div key={i} className="space-y-2">
            <p className="text-xs font-bold text-primary uppercase tracking-wide">{col.title}</p>
            <p className="text-[10px] text-tertiary mb-2">{col.subtitle}</p>
            {(col.cards||[]).map((card:any,j:number)=>(
              <div key={j} className="p-3 bg-base-alt rounded-xl border border-divider">
                <p className="text-xs font-semibold text-primary">{card.title}</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{card.value}</p>
                {card.detail && <p className="text-[10px] text-secondary mt-1">{card.detail}</p>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}