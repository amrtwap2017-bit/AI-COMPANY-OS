// @ts-nocheck
"use client";
export function QueueBoardMatrix({ title, subtitle, columns=[] }:any) {
  const tones:any = { warning:"text-amber-600", success:"text-emerald-600", neutral:"text-slate-500" };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col:any,i:number)=>(
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className={"text-sm font-semibold "+(tones[col.tone]||tones.neutral)}>{col.title}</p>
              {col.subtitle && <span className="text-[10px] text-slate-400">{col.subtitle}</span>}
            </div>
            {(col.cards||[]).slice(0,4).map((card:any,j:number)=>(
              <div key={j} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-800 truncate">{card.title}</p>
                {card.detail && <p className="text-[10px] text-slate-500 mt-0.5 truncate">{card.detail}</p>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}