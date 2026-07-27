// @ts-nocheck
"use client";
import Link from "next/link";
export function RecordListCard({ title, subtitle, items=[], emptyMessage="No records" }:any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-secondary mb-4">{subtitle}</p>}
      {items.length===0 ? (
        <p className="text-sm text-tertiary italic py-4 text-center">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0,5).map((item:any,i:number)=>(
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                {item.meta && <p className="text-xs text-secondary">{item.meta}</p>}
                {item.detail && <p className="text-[10px] text-tertiary mt-0.5 truncate">{item.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}