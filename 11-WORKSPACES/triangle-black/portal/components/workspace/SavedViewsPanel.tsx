// @ts-nocheck
"use client";
import { useState } from "react";
export function SavedViewsPanel({ title, subtitle, views=[] }:any) {
  const [active, setActive] = useState(0);
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="font-semibold text-primary mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-secondary mb-4">{subtitle}</p>}
      <div className="space-y-2">
        {views.map((view:any,i:number)=>(
          <button key={i} onClick={()=>setActive(i)}
            className={`w-full text-left p-3 rounded-xl border transition-all ${active===i?"border-amber-300 bg-amber-50":"border-border hover:border-border"}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-primary">{view.name}</p>
              <span className="text-[9px] bg-surface-alt text-secondary px-1.5 py-0.5 rounded">{view.status}</span>
            </div>
            {view.detail && <p className="text-xs text-secondary mt-0.5">{view.detail}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}