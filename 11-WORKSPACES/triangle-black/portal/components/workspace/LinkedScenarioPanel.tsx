// @ts-nocheck
"use client";
export function LinkedScenarioPanel({ title, subtitle, scenarios=[] }:any) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="font-semibold text-primary mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-secondary mb-4">{subtitle}</p>}
      <div className="space-y-4">
        {scenarios.map((s:any,i:number)=>(
          <div key={i} className="p-4 bg-base-alt rounded-xl">
            <p className="text-sm font-bold text-primary">{s.title}</p>
            {s.detail && <p className="text-xs text-secondary mt-1">{s.detail}</p>}
            {s.chain?.length>0 && (
              <div className="flex items-center gap-1 flex-wrap mt-3">
                {s.chain.map((c:string,j:number)=>(<>
                  <span key={j} className="text-[10px] bg-white border border-border px-2 py-0.5 rounded font-medium text-secondary">{c}</span>
                  {j<s.chain.length-1 && <span className="text-tertiary text-[10px]">→</span>}
                </>))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}