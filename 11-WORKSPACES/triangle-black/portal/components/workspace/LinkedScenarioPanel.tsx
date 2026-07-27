// @ts-nocheck
"use client";
export function LinkedScenarioPanel({ title, subtitle, scenarios=[] }:any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-secondary mb-4">{subtitle}</p>}
      <div className="space-y-4">
        {scenarios.map((s:any,i:number)=>(
          <div key={i} className="p-4 bg-slate-50 rounded-xl">
            <p className="text-sm font-bold text-slate-800">{s.title}</p>
            {s.detail && <p className="text-xs text-secondary mt-1">{s.detail}</p>}
            {s.chain?.length>0 && (
              <div className="flex items-center gap-1 flex-wrap mt-3">
                {s.chain.map((c:string,j:number)=>(<>
                  <span key={j} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded font-medium text-slate-600">{c}</span>
                  {j<s.chain.length-1 && <span className="text-slate-300 text-[10px]">→</span>}
                </>))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}