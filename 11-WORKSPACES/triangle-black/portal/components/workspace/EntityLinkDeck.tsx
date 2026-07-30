// @ts-nocheck
"use client";
import Link from "next/link";
export function EntityLinkDeck({ title, subtitle, items=[] }:any) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5">
      <h3 className="font-semibold text-stone-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-secondary mb-4">{subtitle}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item:any,i:number)=>(
          <Link key={i} href={item.href||"#"}
            className="group p-4 rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded group-hover:bg-amber-100 group-hover:text-amber-700">{item.badge}</span>
            </div>
            <p className="text-sm font-bold text-stone-900 group-hover:text-amber-700">{item.title}</p>
            <p className="text-[10px] text-secondary mt-0.5">{item.detail}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}