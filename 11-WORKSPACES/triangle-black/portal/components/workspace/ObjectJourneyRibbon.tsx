// @ts-nocheck
"use client";
export function ObjectJourneyRibbon({ title, subtitle, steps=[] }:any) {
  const tones:any = { success:"bg-emerald-100 text-emerald-700", warning:"bg-amber-100 text-amber-700", neutral:"bg-slate-100 text-slate-600" };
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5">
      <h3 className="font-semibold text-stone-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-secondary mb-4">{subtitle}</p>}
      <div className="flex items-start gap-2 flex-wrap">
        {steps.map((step:any,i:number)=>(
          <div key={i} className="flex items-center gap-2">
            <div className={"rounded-xl px-3 py-2 "+(tones[step.tone]||tones.neutral)}>
              <p className="text-xs font-bold">{step.label}</p>
              {step.detail && <p className="text-[10px] opacity-75">{step.detail}</p>}
            </div>
            {i<steps.length-1 && <span className="text-slate-300 text-sm">→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}