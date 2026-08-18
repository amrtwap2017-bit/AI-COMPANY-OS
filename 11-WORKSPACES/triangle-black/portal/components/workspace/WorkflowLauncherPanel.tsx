// @ts-nocheck
"use client";
import Link from "next/link";
export function WorkflowLauncherPanel({ title, subtitle, workflows=[] }:any) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="font-semibold text-primary mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-secondary mb-4">{subtitle}</p>}
      <div className="space-y-3">
        {workflows.map((wf:any,i:number)=>(
          <Link key={i} href={wf.href||"#"} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-amber-300 hover:bg-amber-50 transition-all group">
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary group-hover:text-amber-700">{wf.title}</p>
              {wf.detail && <p className="text-xs text-secondary mt-0.5">{wf.detail}</p>}
              {wf.stages?.length>0 && (
                <div className="flex items-center gap-1 mt-2">
                  {wf.stages.map((s:string,j:number)=>(<>
                    <span key={j} className="text-[9px] bg-surface-alt px-1.5 py-0.5 rounded">{s}</span>
                    {j<wf.stages.length-1 && <span className="text-tertiary text-[9px]">→</span>}
                  </>))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}