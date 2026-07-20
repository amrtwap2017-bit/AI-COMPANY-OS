// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { analyticsApi } from "@/lib/analytics-api";
import { PageHeader, MetricStrip, LoadingState, Button } from "@/components/ui";
import { RefreshCw, ChevronRight } from "lucide-react";

export default function MaintenancePage() {
  const kpiQ = useQuery({ queryKey:["maint-kpis"], queryFn:()=>analyticsApi.maintenanceKpis() });
  const kpis = (kpiQ.data as any)?.kpis || [];

  const metrics = kpis.slice(0,4).map((k:any) => ({
    label:k.label, value:k.value ?? "—",
    color: k.status==="critical"?"red":k.status==="warning"?"amber":"orange",
  }));

  const modules = [
    { label:"Asset Tree",        href:"/maintenance/asset-tree",          icon:"🌳", desc:"Hierarchical asset view" },
    { label:"PM Plans",          href:"/maintenance/review",               icon:"📅", desc:"Preventive maintenance planning" },
    { label:"Work Items",        href:"/maintenance/actions",              icon:"🔧", desc:"Active maintenance work items" },
    { label:"Asset 360",         href:"/maintenance/assets/360",          icon:"🔭", desc:"Full asset detail view" },
    { label:"Intelligence",      href:"/maintenance/intelligence",         icon:"🧠", desc:"Maintenance analytics" },
    { label:"Cost Review",       href:"/maintenance/costs/review",         icon:"💰", desc:"Maintenance cost analysis" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Maintenance Center" subtitle="Assets · PM Plans · Work Items · Cost Analysis"
        actions={<Button variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5"/>} onClick={()=>kpiQ.refetch()}>Refresh</Button>} />

      {kpiQ.isLoading ? <LoadingState type="cards" rows={4} cols={4}/> : <MetricStrip metrics={metrics} cols={4}/>}

      <div className="grid grid-cols-3 gap-3">
        {modules.map(mod => (
          <Link key={mod.label} href={mod.href}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-amber-300 hover:shadow-md transition-all group">
            <div className="text-3xl mb-3">{mod.icon}</div>
            <div className="font-bold text-slate-900 text-sm">{mod.label}</div>
            <div className="text-xs text-slate-400 mt-1">{mod.desc}</div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 mt-3 transition-colors"/>
          </Link>
        ))}
      </div>
    </div>
  );
}
