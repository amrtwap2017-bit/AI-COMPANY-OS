import os, json, datetime

LOG    = "/home/amr/AI-COMPANY-OS/tasks/logs/v3.log"
PORTAL = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal"
results = {"created": []}

def log(m):
    ts = datetime.datetime.now().strftime("%H:%M:%S")
    out = "["+ts+"] "+str(m)
    print(out, flush=True)
    open(LOG,"a").write(out+chr(10))

def write(path, content, label):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path,"w") as f: f.write(content)
    log("  CREATED: "+label)
    results["created"].append(label)

log("V3 START — New Module Center Pages")

# ── Approvals Center ─────────────────────────────────────────
approvals = '''// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { PageHeader, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { safeFetch, toList } from "@/lib/safe-api";
import { CheckCircle, XCircle, Clock, FileText, RefreshCw } from "lucide-react";

type Approval = { id:string; title:string; project:string; requested_by:string; date:string; type:string; };

const MOCK: Approval[] = [
  { id:"a1", title:"Variation Order #002: Additional Lighting Points",  project:"Grand Cairo Renovation", requested_by:"Mohamed (Site Eng)", date:"2026-07-12", type:"variation" },
  { id:"a2", title:"Material Approval: Italian Marble Sample",          project:"Grand Cairo Renovation", requested_by:"Amr (PM)",           date:"2026-07-14", type:"material"  },
  { id:"a3", title:"Budget Increase: HVAC System Upgrade",             project:"Sharm Resort Phase 2",   requested_by:"Sara (Finance)",      date:"2026-07-15", type:"budget"    },
  { id:"a4", title:"Contractor Extension: Phase 3 Delay",              project:"Hilton Alexandria",      requested_by:"Khaled (Site)",       date:"2026-07-16", type:"extension" },
  { id:"a5", title:"Purchase Order: Elevator Parts",                   project:"Kempinski Soma Bay",     requested_by:"Omar (Procurement)",  date:"2026-07-17", type:"purchase"  },
];

export default function ApprovalsPage() {
  const [items, setItems]   = useState<Approval[]>(MOCK);
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState<Set<string>>(new Set());

  async function action(id:string, approve:boolean) {
    setDone(d => new Set([...d, id]));
  }

  const pending = items.filter(i => !done.has(i.id));
  const typeColors:any = {
    variation:"bg-purple-100 text-purple-700", material:"bg-blue-100 text-blue-700",
    budget:"bg-red-100 text-red-700", extension:"bg-amber-100 text-amber-700",
    purchase:"bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="space-y-5 pb-12">
      <Breadcrumb/>
      <PageHeader title="Approvals Center" subtitle={`${pending.length} pending approvals`} badge="APV"
        actions={<button onClick={()=>{}} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><RefreshCw className="h-4 w-4"/></button>}/>

      {loading && <LoadingState type="cards" rows={3} cols={1}/>}

      {pending.length===0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4"/>
          <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
          <p className="text-slate-500 mt-2">No pending approvals at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map(item=>(
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-amber-600"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${typeColors[item.type]||"bg-slate-100 text-slate-600"}`}>{item.type}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3"/>{item.date}</span>
                </div>
                <h4 className="font-semibold text-slate-900">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{item.project} · Requested by {item.requested_by}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={()=>action(item.id,false)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors">
                  <XCircle className="w-4 h-4"/> Reject
                </button>
                <button onClick={()=>action(item.id,true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
                  <CheckCircle className="w-4 h-4"/> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {done.size>0 && (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 text-sm text-emerald-700">
          ✅ {done.size} approval(s) processed this session
        </div>
      )}
    </div>
  );
}
'''
write(PORTAL+"/app/(app)/(enterprise)/approvals/page.tsx", approvals, "approvals/page.tsx")

# ── Engineering Hub ──────────────────────────────────────────
engineering = '''// @ts-nocheck
"use client";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Cpu, Brain, BarChart3, Wrench, FileText, ArrowRight, Zap } from "lucide-react";

const MODULES = [
  { label:"AI Assistant",    href:"/engineering/ai",           icon:Brain,    desc:"AI-powered engineering support",          badge:"AI",    highlight:true },
  { label:"Intelligence",    href:"/engineering/intelligence", icon:Zap,      desc:"Smart insights for engineering ops",       badge:"INTEL" },
  { label:"Engineering Hub", href:"/engineering",             icon:Cpu,      desc:"Full engineering dashboard & overview",    badge:"ENG" },
  { label:"Actions",         href:"/engineering/actions",     icon:Wrench,   desc:"Engineering action center",               badge:"ACT" },
  { label:"Review",          href:"/engineering/review",      icon:BarChart3,desc:"Engineering performance review",           badge:"REV" },
  { label:"Projects Center", href:"/projects-center",         icon:FileText, desc:"All engineering projects overview",        badge:"PRJ" },
];

export default function EngineeringCenterPage() {
  return (
    <div className="space-y-6 pb-12">
      <Breadcrumb/>
      <PageHeader title="Engineering Center" subtitle="AI-powered hotel engineering management" badge="ENG"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map(mod=>{
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href}
              className={`group flex flex-col p-5 rounded-2xl border transition-all duration-200 ${
                mod.highlight
                  ? "bg-slate-900 border-slate-700 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10"
                  : "bg-white border-slate-200 hover:border-amber-300 hover:shadow-md"
              }`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                mod.highlight ? "bg-amber-500/20 text-amber-400" : "bg-slate-100 text-slate-600 group-hover:bg-amber-50 group-hover:text-amber-600"
              }`}>
                <Icon className="w-5 h-5"/>
              </div>
              <div className="flex items-start justify-between mb-1">
                <p className={`font-bold text-sm ${mod.highlight?"text-white":"text-slate-900"}`}>{mod.label}</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${mod.highlight?"bg-amber-500/20 text-amber-400":"bg-slate-100 text-slate-500"}`}>{mod.badge}</span>
              </div>
              <p className={`text-xs ${mod.highlight?"text-slate-400":"text-slate-500"}`}>{mod.desc}</p>
              <ArrowRight className={`w-4 h-4 mt-auto pt-3 ${mod.highlight?"text-amber-400 opacity-0 group-hover:opacity-100":"text-slate-300 group-hover:text-amber-500"} transition-all`}/>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
'''
write(PORTAL+"/app/(app)/(enterprise)/engineering/page.tsx", engineering, "engineering/page.tsx")

# ── Maintenance Center ────────────────────────────────────────
maintenance = '''// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, MetricStrip, LoadingState } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { safeFetch, toList } from "@/lib/safe-api";
import { Wrench, Calendar, Package, BarChart3, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";

export default function MaintenancePage() {
  const [assets,  setAssets]  = useState<any[]>([]);
  const [pmPlans, setPmPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    Promise.all([safeFetch("/api/v1/assets"), safeFetch("/api/v1/pm-plans")])
      .then(([a,p])=>{ setAssets(toList(a?.data||a)); setPmPlans(toList(p?.data||p)); })
      .finally(()=>setLoading(false));
  },[]);

  const kpis = [
    { label:"Total Assets",   value: loading?"...":String(assets.length||"0"),  sub:"tracked",     color:"blue"    as const },
    { label:"PM Plans Active",value: loading?"...":String(pmPlans.length||"0"), sub:"scheduled",   color:"emerald" as const },
    { label:"Due This Week",  value: loading?"...":"—",                          sub:"maintenance", color:"amber"   as const },
    { label:"Overdue",        value: loading?"...":"—",                          sub:"past due",    color:"red"     as const },
  ];

  const MODULES = [
    { label:"Assets",         href:"/assets",                         icon:Package,       desc:"All hotel assets & equipment" },
    { label:"Asset Tree",     href:"/maintenance/asset-tree",         icon:Wrench,        desc:"Hierarchical asset structure" },
    { label:"PM Plans",       href:"/maintenance/pm-plans",           icon:Calendar,      desc:"Preventive maintenance plans" },
    { label:"Schedule",       href:"/maintenance/schedule",           icon:Calendar,      desc:"Maintenance schedule & calendar" },
    { label:"Maintenance Hub",href:"/maintenance",                    icon:Wrench,        desc:"Full maintenance overview" },
    { label:"Intelligence",   href:"/maintenance/intelligence",       icon:BarChart3,     desc:"Predictive maintenance insights" },
  ];

  return (
    <div className="space-y-5 pb-12">
      <Breadcrumb/>
      <PageHeader title="Maintenance Center" subtitle="Asset management and preventive maintenance" badge="MNT"/>
      {loading ? <LoadingState type="cards" rows={4} cols={4}/> : <MetricStrip metrics={kpis} cols={4}/>}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {MODULES.map(mod=>{
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href}
              className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-amber-300 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-amber-50">
                <Icon className="w-5 h-5 text-slate-500 group-hover:text-amber-600"/>
              </div>
              <p className="font-semibold text-sm text-slate-900">{mod.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{mod.desc}</p>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 mt-3 transition-colors"/>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
'''
write(PORTAL+"/app/(app)/(enterprise)/maintenance/page.tsx", maintenance, "maintenance/page.tsx")

# ── Supply Chain Center ───────────────────────────────────────
supply = '''// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, MetricStrip, LoadingState } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { safeFetch, toList } from "@/lib/safe-api";
import { ShoppingCart, Package, Truck, FileText, BarChart3, ArrowRight, Users2 } from "lucide-react";

export default function SupplyChainPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [pos,       setPOs]       = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(()=>{
    Promise.all([
      safeFetch("/api/v1/actions/inventory/stock-balances"),
      safeFetch("/api/v1/actions/procurement/dashboard"),
    ]).then(([inv,proc])=>{
      setInventory(toList(inv?.data?.stock_balances||inv?.data||inv));
      setPOs(toList(proc?.data?.purchase_orders||proc?.data||proc));
    }).finally(()=>setLoading(false));
  },[]);

  const lowStock = inventory.filter((i:any)=>(i.quantity||i.balance||0)<5).length;

  const kpis = [
    { label:"Inventory Items", value:loading?"...":String(inventory.length||"0"), sub:"tracked",   color:"blue"    as const },
    { label:"Purchase Orders", value:loading?"...":String(pos.length||"0"),       sub:"active",    color:"amber"   as const },
    { label:"Low Stock",       value:loading?"...":String(lowStock),              sub:"need reorder",color:"red"   as const },
    { label:"Suppliers",       value:loading?"...":"—",                           sub:"registered",color:"emerald" as const },
  ];

  const MODULES = [
    { label:"Inventory",         href:"/inventory",                        icon:Package,    desc:"Stock levels & items" },
    { label:"Warehouses",        href:"/warehouses",                       icon:ShoppingCart, desc:"Warehouse management" },
    { label:"Purchase Orders",   href:"/supply-chain/purchase-orders",     icon:FileText,   desc:"PO management" },
    { label:"Purchase Requests", href:"/supply-chain/purchase-requests",   icon:FileText,   desc:"Request for purchase" },
    { label:"Suppliers",         href:"/supply-chain/suppliers",           icon:Users2,     desc:"Vendor & supplier directory" },
    { label:"RFQs",              href:"/supply-chain/rfqs",                icon:FileText,   desc:"Request for quotations" },
    { label:"Intelligence",      href:"/supply-chain/intelligence",        icon:BarChart3,  desc:"Supply chain analytics" },
    { label:"SC Command",        href:"/supply-chain/command",             icon:BarChart3,  desc:"Supply chain command center" },
  ];

  return (
    <div className="space-y-5 pb-12">
      <Breadcrumb/>
      <PageHeader title="Supply Chain & Procurement" subtitle="Inventory, purchasing and vendor management" badge="SCM"/>
      {loading ? <LoadingState type="cards" rows={4} cols={4}/> : <MetricStrip metrics={kpis} cols={4}/>}
      {lowStock>0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          ⚠️ <strong>{lowStock} items</strong> below minimum stock level — review inventory
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {MODULES.map(mod=>{
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href}
              className="group bg-white rounded-2xl border border-slate-200 p-4 hover:border-amber-300 hover:shadow-sm transition-all">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-amber-50">
                <Icon className="w-4 h-4 text-slate-500 group-hover:text-amber-600"/>
              </div>
              <p className="font-semibold text-sm text-slate-900">{mod.label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{mod.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
'''
write(PORTAL+"/app/(app)/(enterprise)/supply-chain/page.tsx", supply, "supply-chain/page.tsx")

# ── Operations Center  ───────────────────────────────────────
operations = '''// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, MetricStrip, LoadingState } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { safeFetch, toList } from "@/lib/safe-api";
import { Wrench, Users, MapPin, Clock, Calendar, GitBranch, LayoutDashboard, ArrowRight } from "lucide-react";

export default function OperationsPage() {
  const [wos,   setWos]   = useState<any[]>([]);
  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    Promise.all([
      safeFetch("/api/v1/actions/dashboard/service-ops"),
      safeFetch("/api/v1/technicians"),
    ]).then(([ops, t])=>{
      setWos(toList(ops?.data?.work_orders||ops?.data||ops));
      setTechs(toList(t?.data||t));
    }).finally(()=>setLoading(false));
  },[]);

  const critical = wos.filter((w:any)=>w.priority==="critical"||w.priority==="emergency").length;
  const kpis = [
    { label:"Open Work Orders",  value:loading?"...":String(wos.filter((w:any)=>w.status==="open").length||"0"),        sub:"need attention", color:"amber"   as const },
    { label:"In Progress",       value:loading?"...":String(wos.filter((w:any)=>w.status==="in_progress").length||"0"), sub:"active",         color:"blue"    as const },
    { label:"Active Technicians",value:loading?"...":String(techs.filter((t:any)=>t.is_active).length||"0"),            sub:"on roster",      color:"emerald" as const },
    { label:"Critical",          value:loading?"...":String(critical),                                                   sub:"urgent",         color: critical>0?"red":"slate" as const },
  ];

  const MODULES = [
    { label:"Operations Workbench",href:"/operations/workbench",          icon:LayoutDashboard, desc:"Daily operations command center",    highlight:true },
    { label:"Work Orders",         href:"/work-orders",                   icon:Wrench,          desc:"All work orders & history" },
    { label:"New Work Order",      href:"/operations/work-orders/new",    icon:Wrench,          desc:"Create a new work order" },
    { label:"Service Requests",    href:"/operations/service-requests",   icon:Wrench,          desc:"Incoming service requests" },
    { label:"Dispatch Board",      href:"/operations/dispatch",           icon:MapPin,          desc:"Assign technicians to jobs" },
    { label:"SLA Review",          href:"/operations/sla-review",        icon:Clock,           desc:"SLA compliance monitoring" },
    { label:"Calendar",            href:"/operations/calendar",           icon:Calendar,        desc:"Schedule & calendar view" },
    { label:"Workflows",           href:"/operations/workflows",          icon:GitBranch,       desc:"Approval workflows" },
  ];

  return (
    <div className="space-y-5 pb-12">
      <Breadcrumb/>
      <PageHeader title="Operations Center" subtitle="Work orders, dispatch, SLA and field operations" badge="OPS"/>
      {loading ? <LoadingState type="cards" rows={4} cols={4}/> : <MetricStrip metrics={kpis} cols={4}/>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {MODULES.map(mod=>{
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href}
              className={`group flex flex-col p-4 rounded-2xl border transition-all ${
                mod.highlight
                  ? "bg-slate-900 border-slate-800 hover:border-amber-500/50"
                  : "bg-white border-slate-200 hover:border-amber-300 hover:shadow-sm"
              }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${mod.highlight?"bg-amber-500/20 text-amber-400":"bg-slate-100 text-slate-500 group-hover:bg-amber-50 group-hover:text-amber-600"}`}>
                <Icon className="w-4 h-4"/>
              </div>
              <p className={`font-semibold text-sm ${mod.highlight?"text-white":"text-slate-900"}`}>{mod.label}</p>
              <p className={`text-[11px] mt-0.5 ${mod.highlight?"text-slate-400":"text-slate-500"}`}>{mod.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
'''
write(PORTAL+"/app/(app)/(enterprise)/operations/page.tsx", operations, "operations/page.tsx")

import json as _j
with open("/home/amr/AI-COMPANY-OS/tasks/logs/v3_result.json","w") as f:
    _j.dump(results,f,indent=2)
log("="*40)
log("V3 COMPLETE — Created: "+str(len(results["created"])))
for c in results["created"]: log("  OK "+c)
