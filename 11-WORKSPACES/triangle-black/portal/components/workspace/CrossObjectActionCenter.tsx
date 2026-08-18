// @ts-nocheck
"use client";
export function CrossObjectActionCenter({ title="Action Center", actions=[] }:any) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="font-semibold text-primary mb-4">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.slice(0,6).map((a:any,i:number)=>(
          <button key={i} className="p-3 rounded-xl border border-border hover:border-amber-300 hover:bg-amber-50 transition-all text-left">
            <p className="text-sm font-semibold text-primary">{a.title||a.label||"Action"}</p>
            {a.description && <p className="text-[10px] text-secondary mt-0.5">{a.description}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}