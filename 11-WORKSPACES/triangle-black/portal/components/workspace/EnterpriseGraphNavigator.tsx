// @ts-nocheck
"use client";
import Link from "next/link";
export function EnterpriseGraphNavigator({ title, subtitle, nodes=[] }:any) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5">
      <h3 className="font-semibold text-stone-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-secondary mb-4">{subtitle}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {nodes.map((node:any,i:number)=>(
          <Link key={i} href={node.href||"#"} className="p-3 rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-sm transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded">{node.badge}</span>
            </div>
            <p className="text-sm font-semibold text-stone-900 group-hover:text-amber-700">{node.title}</p>
            <p className="text-[10px] text-secondary mt-0.5">{node.detail}</p>
            {node.connections?.length>0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {node.connections.slice(0,3).map((c:string)=>(<span key={c} className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-secondary">{c}</span>))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}