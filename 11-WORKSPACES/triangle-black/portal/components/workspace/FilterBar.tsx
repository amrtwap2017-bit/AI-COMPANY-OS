// @ts-nocheck
"use client";
import { useState } from "react";
export function FilterBar({ title, subtitle, groups=[], onFilter }:any) {
  const [selected, setSelected] = useState<Record<string,string>>({});
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      {title && <p className="text-sm font-semibold text-slate-700 mb-3">{title}</p>}
      <div className="flex flex-wrap gap-4">
        {groups.map((group:any,i:number)=>(
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">{group.title}:</span>
            <div className="flex gap-1">
              {group.options.map((opt:any)=>(
                <button key={opt.value}
                  onClick={()=>setSelected(s=>({...s,[group.title]:opt.value}))}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    selected[group.title]===opt.value
                      ? "bg-amber-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}