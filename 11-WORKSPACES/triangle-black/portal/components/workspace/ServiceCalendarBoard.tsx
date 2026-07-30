// @ts-nocheck
"use client";
export function ServiceCalendarBoard({ title, subtitle, buckets=[] }:any) {
  const tones:any = { success:"bg-emerald-50 border-emerald-200 text-emerald-800", warning:"bg-amber-50 border-amber-200 text-amber-800", neutral:"bg-slate-50 border-stone-200 text-slate-600" };
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5">
      <h3 className="font-semibold text-stone-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-secondary mb-4">{subtitle}</p>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {buckets.map((b:any,i:number)=>(
          <div key={i} className={"rounded-xl border p-4 "+(tones[b.tone]||tones.neutral)}>
            <p className="text-2xl font-bold">{b.count}</p>
            <p className="text-sm font-semibold mt-1">{b.label}</p>
            {b.detail && <p className="text-[10px] mt-1 opacity-75">{b.detail}</p>}
            {(b.items||[]).slice(0,2).map((item:any,j:number)=>(
              <div key={j} className="mt-2 p-2 bg-white/50 rounded-lg">
                <p className="text-[10px] font-medium truncate">{item.title}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}