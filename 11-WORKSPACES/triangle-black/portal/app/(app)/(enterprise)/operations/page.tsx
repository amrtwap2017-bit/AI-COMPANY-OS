// @ts-nocheck
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
