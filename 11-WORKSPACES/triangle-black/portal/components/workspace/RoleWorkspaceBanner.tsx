// @ts-nocheck
"use client";
export function RoleWorkspaceBanner({ role, title, description, actions=[] }:any) {
  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-white mb-2">
      <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">{role}</p>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      {description && <p className="text-sm text-slate-400 max-w-2xl">{description}</p>}
      {actions.length>0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {actions.map((a:string,i:number)=>(<span key={i} className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">{a}</span>))}
        </div>
      )}
    </div>
  );
}