// @ts-nocheck
"use client";
export function SignalStrip({ title, subtitle, items=[] }:any) {
  const tones:any = { warning:"text-amber-600 bg-amber-50", success:"text-emerald-600 bg-emerald-50", neutral:"text-secondary bg-base-alt" };
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="font-semibold text-primary mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-secondary mb-3">{subtitle}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item:any,i:number)=>(
          <div key={i} className={"rounded-xl p-3 "+(tones[item.tone]||tones.neutral)}>
            <p className="text-xl font-bold">{item.value}</p>
            <p className="text-xs font-semibold mt-0.5">{item.label}</p>
            {item.detail && <p className="text-[10px] mt-0.5 opacity-75">{item.detail}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}