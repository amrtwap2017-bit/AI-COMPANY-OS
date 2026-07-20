import os, glob, re, json, datetime

LOG    = "/home/amr/AI-COMPANY-OS/tasks/logs/v2.log"
PORTAL = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal"
results = {"upgraded": [], "skipped": [], "errors": []}

def log(m):
    ts = datetime.datetime.now().strftime("%H:%M:%S")
    out = "["+ts+"] "+str(m)
    print(out, flush=True)
    open(LOG,"a").write(out+chr(10))

def write(path, content, label):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path,"w") as f: f.write(content)
    log("  CREATED: "+label)
    results["upgraded"].append(label)

log("V2 START — Replace Old Components with New Design System")

# Create lightweight replacements for old workspace components
# These keep the DATA but use the new design system

REPLACEMENTS = {
"RoleWorkbenchHero": """// @ts-nocheck
"use client";
export function RoleWorkbenchHero({ eyebrow, title, subtitle, badges=[] }:any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-2">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">{eyebrow}</p>}
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-1 max-w-2xl">{subtitle}</p>}
      {badges.length>0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {badges.map((b:string)=>(
            <span key={b} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">{b}</span>
          ))}
        </div>
      )}
    </div>
  );
}""",

"RoleWorkspaceBanner": """// @ts-nocheck
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
}""",

"SLARiskBoard": """// @ts-nocheck
"use client";
export function SLARiskBoard({ title, subtitle, items=[] }:any) {
  const colors:any = { warning:"bg-amber-50 border-amber-200 text-amber-700", success:"bg-emerald-50 border-emerald-200 text-emerald-700", neutral:"bg-slate-50 border-slate-200 text-slate-600" };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item:any,i:number)=>(
          <div key={i} className={"rounded-xl border p-3 "+(colors[item.severity]||colors.neutral)}>
            <p className="text-xl font-bold">{item.value}</p>
            <p className="text-xs font-semibold mt-0.5">{item.title}</p>
            {item.detail && <p className="text-[10px] mt-1 opacity-75">{item.detail}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}""",

"QueueBoardMatrix": """// @ts-nocheck
"use client";
export function QueueBoardMatrix({ title, subtitle, columns=[] }:any) {
  const tones:any = { warning:"text-amber-600", success:"text-emerald-600", neutral:"text-slate-500" };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col:any,i:number)=>(
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className={"text-sm font-semibold "+(tones[col.tone]||tones.neutral)}>{col.title}</p>
              {col.subtitle && <span className="text-[10px] text-slate-400">{col.subtitle}</span>}
            </div>
            {(col.cards||[]).slice(0,4).map((card:any,j:number)=>(
              <div key={j} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-800 truncate">{card.title}</p>
                {card.detail && <p className="text-[10px] text-slate-500 mt-0.5 truncate">{card.detail}</p>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}""",

"DispatchWorkspacePanel": """// @ts-nocheck
"use client";
export function DispatchWorkspacePanel({ title, subtitle, lanes=[] }:any) {
  const tones:any = { warning:"border-amber-200 bg-amber-50", success:"border-emerald-200 bg-emerald-50", neutral:"border-slate-200 bg-slate-50" };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {lanes.map((lane:any,i:number)=>(
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-slate-800">{lane.title}</p>
              <span className="text-[10px] text-slate-400">{lane.subtitle}</span>
            </div>
            {(lane.records||[]).slice(0,5).map((rec:any,j:number)=>(
              <div key={j} className={"p-3 rounded-xl border "+(tones[lane.tone]||tones.neutral)}>
                <p className="text-xs font-semibold text-slate-800 truncate">{rec.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{rec.meta}</p>
              </div>
            ))}
            {!lane.records?.length && <p className="text-xs text-slate-400 italic p-3">No items</p>}
          </div>
        ))}
      </div>
    </div>
  );
}""",

"ServiceCalendarBoard": """// @ts-nocheck
"use client";
export function ServiceCalendarBoard({ title, subtitle, buckets=[] }:any) {
  const tones:any = { success:"bg-emerald-50 border-emerald-200 text-emerald-800", warning:"bg-amber-50 border-amber-200 text-amber-800", neutral:"bg-slate-50 border-slate-200 text-slate-600" };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {buckets.map((b:any,i:number)=>(
          <div key={i} className={"rounded-xl border p-4 "+(tones[b.tone]||tones.neutral)}>
            <p className="text-2xl font-bold">{b.count}</p>
            <p className="text-sm font-semibold mt-1">{b.label}</p>
            {b.detail && <p className="text-[10px] mt-1 opacity-75">{b.detail}</p>}
            {(b.items||[]).slice(0,2).map((item:any,j:number)=>(
              <div key={j} className="mt-2 p-2 bg-white/50 rounded-lg">
                <p className="text-[10px] font-medium truncate">{item.title}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}""",

"EnterpriseGraphNavigator": """// @ts-nocheck
"use client";
import Link from "next/link";
export function EnterpriseGraphNavigator({ title, subtitle, nodes=[] }:any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {nodes.map((node:any,i:number)=>(
          <Link key={i} href={node.href||"#"} className="p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-sm transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded">{node.badge}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 group-hover:text-amber-700">{node.title}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{node.detail}</p>
            {node.connections?.length>0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {node.connections.slice(0,3).map((c:string)=>(<span key={c} className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{c}</span>))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}""",

"WorkflowLauncherPanel": """// @ts-nocheck
"use client";
import Link from "next/link";
export function WorkflowLauncherPanel({ title, subtitle, workflows=[] }:any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className="space-y-3">
        {workflows.map((wf:any,i:number)=>(
          <Link key={i} href={wf.href||"#"} className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all group">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 group-hover:text-amber-700">{wf.title}</p>
              {wf.detail && <p className="text-xs text-slate-500 mt-0.5">{wf.detail}</p>}
              {wf.stages?.length>0 && (
                <div className="flex items-center gap-1 mt-2">
                  {wf.stages.map((s:string,j:number)=>(<>
                    <span key={j} className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded">{s}</span>
                    {j<wf.stages.length-1 && <span className="text-slate-300 text-[9px]">→</span>}
                  </>))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}""",

"InsightStack": """// @ts-nocheck
"use client";
export function InsightStack({ title, subtitle, items=[] }:any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className="space-y-3">
        {items.map((item:any,i:number)=>(
          <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
            <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              {item.detail && <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}""",

"WatchlistPanel": """// @ts-nocheck
"use client";
export function WatchlistPanel({ title, subtitle, items=[] }:any) {
  const sevColors:any = { critical:"text-red-600 bg-red-50 border-red-200", warning:"text-amber-600 bg-amber-50 border-amber-200", success:"text-emerald-600 bg-emerald-50 border-emerald-200" };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      {items.length===0 ? (
        <p className="text-sm text-slate-400 italic py-4 text-center">No watch items</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0,6).map((item:any,i:number)=>(
            <div key={i} className={"p-3 rounded-xl border "+(sevColors[item.severity]||sevColors.warning)}>
              <p className="text-xs font-semibold">{item.title}</p>
              {item.detail && <p className="text-[10px] mt-0.5 opacity-75">{item.detail}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}""",

"CrossObjectActionCenter": """// @ts-nocheck
"use client";
export function CrossObjectActionCenter({ title="Action Center", actions=[] }:any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.slice(0,6).map((a:any,i:number)=>(
          <button key={i} className="p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all text-left">
            <p className="text-sm font-semibold text-slate-800">{a.title||a.label||"Action"}</p>
            {a.description && <p className="text-[10px] text-slate-500 mt-0.5">{a.description}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}""",

"ObjectLinkMap": """// @ts-nocheck
"use client";
export function ObjectLinkMap({ title, subtitle, nodes=[] }:any) {
  const tones:any = { warning:"border-amber-300 bg-amber-50", success:"border-emerald-300 bg-emerald-50", neutral:"border-slate-200 bg-slate-50" };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {nodes.map((node:any,i:number)=>(
          <div key={i} className={"p-3 rounded-xl border "+(tones[node.tone]||tones.neutral)}>
            <p className="text-lg font-bold text-slate-900">{node.value}</p>
            <p className="text-xs font-semibold text-slate-700">{node.title}</p>
            {node.detail && <p className="text-[10px] text-slate-500 mt-1">{node.detail}</p>}
            {node.connections?.length>0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {node.connections.slice(0,3).map((c:string)=>(<span key={c} className="text-[9px] bg-white border px-1.5 py-0.5 rounded text-slate-500">{c}</span>))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}""",

"SignalStrip": """// @ts-nocheck
"use client";
export function SignalStrip({ title, subtitle, items=[] }:any) {
  const tones:any = { warning:"text-amber-600 bg-amber-50", success:"text-emerald-600 bg-emerald-50", neutral:"text-slate-600 bg-slate-50" };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-3">{subtitle}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item:any,i:number)=>(
          <div key={i} className={"rounded-xl p-3 "+(tones[item.tone]||tones.neutral)}>
            <p className="text-xl font-bold">{item.value}</p>
            <p className="text-xs font-semibold mt-0.5">{item.label}</p>
            {item.detail && <p className="text-[10px] mt-0.5 opacity-75">{item.detail}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}""",

"QueueBoard": """// @ts-nocheck
"use client";
export function QueueBoard({ title, subtitle, columns=[] }:any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {columns.map((col:any,i:number)=>(
          <div key={i} className="space-y-2">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">{col.title}</p>
            <p className="text-[10px] text-slate-400 mb-2">{col.subtitle}</p>
            {(col.cards||[]).map((card:any,j:number)=>(
              <div key={j} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-800">{card.title}</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{card.value}</p>
                {card.detail && <p className="text-[10px] text-slate-500 mt-1">{card.detail}</p>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}""",

"IntegrationStatusPanel": """// @ts-nocheck
"use client";
export function IntegrationStatusPanel({ title, subtitle, items=[] }:any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className="space-y-2">
        {items.map((item:any,i:number)=>(
          <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.ok?"bg-emerald-500":"bg-red-400"}`}/>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">{item.label}</p>
              {item.detail && <p className="text-xs text-slate-500 truncate">{item.detail}</p>}
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.ok?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-700"}`}>
              {item.ok?"Live":"Down"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}""",

"RecordListCard": """// @ts-nocheck
"use client";
import Link from "next/link";
export function RecordListCard({ title, subtitle, items=[], emptyMessage="No records" }:any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      {items.length===0 ? (
        <p className="text-sm text-slate-400 italic py-4 text-center">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0,5).map((item:any,i:number)=>(
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                {item.meta && <p className="text-xs text-slate-500">{item.meta}</p>}
                {item.detail && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}""",

"EntityShell": """// @ts-nocheck
"use client";
export function EntityShell({ title, badge, children, actions }:any) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {badge && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">{badge}</span>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}""",

"ObjectJourneyRibbon": """// @ts-nocheck
"use client";
export function ObjectJourneyRibbon({ title, subtitle, steps=[] }:any) {
  const tones:any = { success:"bg-emerald-100 text-emerald-700", warning:"bg-amber-100 text-amber-700", neutral:"bg-slate-100 text-slate-600" };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className="flex items-start gap-2 flex-wrap">
        {steps.map((step:any,i:number)=>(
          <div key={i} className="flex items-center gap-2">
            <div className={"rounded-xl px-3 py-2 "+(tones[step.tone]||tones.neutral)}>
              <p className="text-xs font-bold">{step.label}</p>
              {step.detail && <p className="text-[10px] opacity-75">{step.detail}</p>}
            </div>
            {i<steps.length-1 && <span className="text-slate-300 text-sm">→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}""",

"FilterBar": """// @ts-nocheck
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
}""",

"EntityLinkDeck": """// @ts-nocheck
"use client";
import Link from "next/link";
export function EntityLinkDeck({ title, subtitle, items=[] }:any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item:any,i:number)=>(
          <Link key={i} href={item.href||"#"}
            className="group p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded group-hover:bg-amber-100 group-hover:text-amber-700">{item.badge}</span>
            </div>
            <p className="text-sm font-bold text-slate-900 group-hover:text-amber-700">{item.title}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{item.detail}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}""",

"LinkedScenarioPanel": """// @ts-nocheck
"use client";
export function LinkedScenarioPanel({ title, subtitle, scenarios=[] }:any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className="space-y-4">
        {scenarios.map((s:any,i:number)=>(
          <div key={i} className="p-4 bg-slate-50 rounded-xl">
            <p className="text-sm font-bold text-slate-800">{s.title}</p>
            {s.detail && <p className="text-xs text-slate-500 mt-1">{s.detail}</p>}
            {s.chain?.length>0 && (
              <div className="flex items-center gap-1 flex-wrap mt-3">
                {s.chain.map((c:string,j:number)=>(<>
                  <span key={j} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded font-medium text-slate-600">{c}</span>
                  {j<s.chain.length-1 && <span className="text-slate-300 text-[10px]">→</span>}
                </>))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}""",

"SavedViewsPanel": """// @ts-nocheck
"use client";
import { useState } from "react";
export function SavedViewsPanel({ title, subtitle, views=[] }:any) {
  const [active, setActive] = useState(0);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className="space-y-2">
        {views.map((view:any,i:number)=>(
          <button key={i} onClick={()=>setActive(i)}
            className={`w-full text-left p-3 rounded-xl border transition-all ${active===i?"border-amber-300 bg-amber-50":"border-slate-200 hover:border-slate-300"}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">{view.name}</p>
              <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{view.status}</span>
            </div>
            {view.detail && <p className="text-xs text-slate-500 mt-0.5">{view.detail}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}""",
}

# Write all replacement components to workspace/
ws_dir = PORTAL + "/components/workspace"
os.makedirs(ws_dir, exist_ok=True)

written = 0
for comp_name, comp_code in REPLACEMENTS.items():
    path = ws_dir + "/" + comp_name + ".tsx"
    with open(path,"w") as f: f.write(comp_code)
    written += 1

log(f"  ✅ Written {written} upgraded workspace components")
results["upgraded"].append(f"{written} workspace components upgraded")

# Add Breadcrumb to enterprise pages that are missing it
log("")
log("Adding Breadcrumb to enterprise pages missing it...")
ent_pages = glob.glob(PORTAL+"/app/(app)/(enterprise)/**/page.tsx", recursive=True)
ent_pages = [f for f in ent_pages if "node_modules" not in f]

added_bc = 0
for f in ent_pages:
    try:
        with open(f) as fp: content = fp.read()
        if "Breadcrumb" not in content and "use client" in content.lower():
            # Add Breadcrumb import and usage
            content = content.replace(
                'from "@/components/ui";',
                'from "@/components/ui";\nimport { Breadcrumb } from "@/components/ui/Breadcrumb";'
            )
            # Add <Breadcrumb/> after the first <div or <main
            content = re.sub(
                r'(<div[^>]*className="space-y-\d+[^"]*">)',
                r'\1\n      <Breadcrumb/>',
                content, count=1
            )
            with open(f,"w") as fp: fp.write(content)
            added_bc += 1
    except: pass

log(f"  Added Breadcrumb to {added_bc} enterprise pages")
results["upgraded"].append(f"Breadcrumb added to {added_bc} pages")

import json as _j
with open("/home/amr/AI-COMPANY-OS/tasks/logs/v2_result.json","w") as f:
    _j.dump(results,f,indent=2)
log("="*40)
log("V2 COMPLETE")
log("  Upgraded: "+str(len(results["upgraded"])))
for u in results["upgraded"]: log("  OK "+str(u))
