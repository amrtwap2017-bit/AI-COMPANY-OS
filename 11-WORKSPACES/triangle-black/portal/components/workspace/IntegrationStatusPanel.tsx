// @ts-nocheck
"use client";
export function IntegrationStatusPanel({ title, subtitle, items=[] }:any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className="space-y-2">
        {items.map((item:any,i:number)=>(
          <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.ok?"bg-emerald-500":"bg-red-400"}`}/>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">{item.label}</p>
              {item.detail && <p className="text-xs text-slate-500 truncate">{item.detail}</p>}
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.ok?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-700"}`}>
              {item.ok?"Live":"Down"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}