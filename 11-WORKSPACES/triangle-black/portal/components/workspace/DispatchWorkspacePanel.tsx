// @ts-nocheck
"use client";
export function DispatchWorkspacePanel({ title, subtitle, lanes=[] }:any) {
  const tones:any = { warning:"border-amber-200 bg-amber-50", success:"border-emerald-200 bg-emerald-50", neutral:"border-border bg-base-alt" };
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="font-semibold text-primary mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-secondary mb-4">{subtitle}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {lanes.map((lane:any,i:number)=>(
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-primary">{lane.title}</p>
              <span className="text-[10px] text-tertiary">{lane.subtitle}</span>
            </div>
            {(lane.records||[]).slice(0,5).map((rec:any,j:number)=>(
              <div key={j} className={"p-3 rounded-xl border "+(tones[lane.tone]||tones.neutral)}>
                <p className="text-xs font-semibold text-primary truncate">{rec.title}</p>
                <p className="text-[10px] text-secondary mt-0.5">{rec.meta}</p>
              </div>
            ))}
            {!lane.records?.length && <p className="text-xs text-tertiary italic p-3">No items</p>}
          </div>
        ))}
      </div>
    </div>
  );
}