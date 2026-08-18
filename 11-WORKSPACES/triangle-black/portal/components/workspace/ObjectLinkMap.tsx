// @ts-nocheck
"use client";
export function ObjectLinkMap({ title, subtitle, nodes=[] }:any) {
  const tones:any = { warning:"border-amber-300 bg-amber-50", success:"border-emerald-300 bg-emerald-50", neutral:"border-border bg-base-alt" };
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="font-semibold text-primary mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-secondary mb-4">{subtitle}</p>}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {nodes.map((node:any,i:number)=>(
          <div key={i} className={"p-3 rounded-xl border "+(tones[node.tone]||tones.neutral)}>
            <p className="text-lg font-bold text-primary">{node.value}</p>
            <p className="text-xs font-semibold text-primary">{node.title}</p>
            {node.detail && <p className="text-[10px] text-secondary mt-1">{node.detail}</p>}
            {node.connections?.length>0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {node.connections.slice(0,3).map((c:string)=>(<span key={c} className="text-[9px] bg-white border px-1.5 py-0.5 rounded text-secondary">{c}</span>))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}