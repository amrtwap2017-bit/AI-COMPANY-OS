// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { maintenanceApi } from "@/lib/api/enterprise";
import { PageHeader, LoadingState, AlertBanner } from "@/components/ui";
import { PageWrapper } from "@/components/ui";
import { Wrench, Calendar, Package, BarChart3, ArrowRight, RefreshCw } from "lucide-react";

export default function MaintenancePage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["maintenance-dashboard"],
    queryFn:  () => maintenanceApi.dashboard(),
    refetchInterval: 60_000,
  });

  const kpis = data?.data || {};

  const metrics = [
    { label:"Total Assets",    value: isLoading ? "..." : String(kpis.total_assets     ?? 0), sub:"tracked",     color:"blue",    href:"/assets" },
    { label:"Active PM Plans", value: isLoading ? "..." : String(kpis.active_pm_plans  ?? 0), sub:"scheduled",   color:"emerald", href:"/maintenance/pm-plans" },
    { label:"Open Work Orders",value: isLoading ? "..." : String(kpis.open_work_orders ?? 0), sub:"need action", color:"amber",   href:"/operations/work-orders" },
    { label:"Critical",        value: isLoading ? "..." : String(kpis.critical         ?? 0), sub:"urgent",      color: (kpis.critical ?? 0) > 0 ? "red" : "slate", href:"/operations/work-orders" },
  ];

  const MODULES = [
    { label:"Assets",        href:"/assets",                    icon:Package,   desc:"All hotel assets and equipment" },
    { label:"Asset Tree",    href:"/maintenance/asset-tree",    icon:Wrench,    desc:"Hierarchical asset structure" },
    { label:"PM Plans",      href:"/maintenance/pm-plans",      icon:Calendar,  desc:"Preventive maintenance plans" },
    { label:"Schedule",      href:"/maintenance/schedule",      icon:Calendar,  desc:"Maintenance schedule overview" },
    { label:"Intelligence",  href:"/maintenance/intelligence",  icon:BarChart3, desc:"Predictive maintenance insights" },
    { label:"Actions",       href:"/maintenance/actions",       icon:Wrench,    desc:"Work items requiring action" },
    { label:"Cost Review",   href:"/maintenance/costs/review",  icon:BarChart3, desc:"Maintenance cost analysis" },
    { label:"Downtime",      href:"/maintenance/downtime/review",icon:Wrench,   desc:"Asset downtime records" },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Maintenance Center" subtitle="Asset management and preventive maintenance" badge="MNT"
        actions={
          <button onClick={() => refetch()} disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        } />

      {isError && <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed to load"} />}

      {/* KPI Cards */}
      {isLoading ? <LoadingState type="cards" rows={4} cols={4} /> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map(m => {
            const colorMap: Record<string,string> = {
              blue:"bg-blue-50 border-blue-100 text-blue-700",
              emerald:"bg-emerald-50 border-emerald-100 text-emerald-700",
              amber:"bg-amber-50 border-amber-100 text-amber-700",
              red:"bg-red-50 border-red-100 text-red-700",
              slate:"bg-white border-slate-200 text-slate-900",
            };
            const [bg, border, val] = (colorMap[m.color] || colorMap.slate).split(" ");
            return (
              <Link key={m.label} href={m.href}
                className={"rounded-2xl border p-4 hover:shadow-sm transition-all " + bg + " " + border}>
                <div className={"text-3xl font-bold " + val}>{m.value}</div>
                <div className="text-sm font-medium text-slate-700 mt-1">{m.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{m.sub}</div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Module Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {MODULES.map(mod => {
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href}
              className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-amber-300 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-amber-50">
                <Icon className="w-5 h-5 text-slate-500 group-hover:text-amber-600" />
              </div>
              <p className="font-semibold text-sm text-slate-900">{mod.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{mod.desc}</p>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 mt-3 transition-colors" />
            </Link>
          );
        })}
      </div>
    </PageWrapper>
  );
}
