// @ts-nocheck
"use client";
export function WatchlistPanel({ title, subtitle, items=[] }:any) {
  const sevColors:any = { critical:"text-red-600 bg-red-50 border-red-200", warning:"text-amber-600 bg-amber-50 border-amber-200", success:"text-emerald-600 bg-emerald-50 border-emerald-200" };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      {items.length===0 ? (
        <p className="text-sm text-slate-400 italic py-4 text-center">No watch items</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0,6).map((item:any,i:number)=>(
            <div key={i} className={"p-3 rounded-xl border "+(sevColors[item.severity]||sevColors.warning)}>
              <p className="text-xs font-semibold">{item.title}</p>
              {item.detail && <p className="text-[10px] mt-0.5 opacity-75">{item.detail}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}