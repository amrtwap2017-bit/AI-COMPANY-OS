// @ts-nocheck
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
