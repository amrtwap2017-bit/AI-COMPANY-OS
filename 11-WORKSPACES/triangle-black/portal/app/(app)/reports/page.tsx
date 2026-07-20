// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, LoadingState } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { reportsApi } from "@/lib/api/reports";
import { BarChart3, TrendingUp, Users, Wrench, Package, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";

function KpiCard({ title, value, sub, trend, icon: Icon, color="amber" }:any) {
  const c: any = { amber:"bg-amber-50 text-amber-600", blue:"bg-blue-50 text-blue-600",
    emerald:"bg-emerald-50 text-emerald-600", red:"bg-red-50 text-red-600",
    slate:"bg-slate-100 text-slate-600" };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c[color]||c.amber}`}>
          <Icon className="w-5 h-5"/>
        </div>
        {trend!==undefined&&<span className={`text-xs font-bold flex items-center gap-0.5 ${trend>0?"text-emerald-600":"text-red-500"}`}>
          {trend>0?<ArrowUp className="w-3 h-3"/>:<ArrowDown className="w-3 h-3"/>}{Math.abs(trend)}%
        </span>}
      </div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="text-sm font-medium text-slate-700 mt-1">{title}</div>
      {sub&&<div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function ReportsPage() {
  const { data:stats, isLoading, refetch } = useQuery({
    queryKey: ["reports-stats"],
    queryFn:  async () => {
      const [s, r] = await Promise.all([
        reportsApi.stats(),
        reportsApi.dashboard(),
      ]);
      return { stats: s.data||{}, report: r.data||{} };
    },
    staleTime: 60_000,
  });

  const s = stats?.stats || {};
  const r = stats?.report || {};

  return (
    <div className="space-y-6 pb-12">
      <Breadcrumb/>
      <PageHeader title="Reports & Analytics" subtitle="Live KPIs from TB Admin" badge="RPT"
        actions={<button onClick={()=>refetch()} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><RefreshCw className="h-4 w-4"/></button>}/>

      {isLoading ? <LoadingState type="cards" rows={8} cols={4}/> : (<>
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Commercial</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Leads"    value={s.total_leads||r.total_leads||0}         sub="in pipeline"    icon={TrendingUp} color="blue"/>
            <KpiCard title="Qualified"      value={s.qualified_leads||r.qualified_leads||0} sub="ready to close" icon={TrendingUp} color="emerald" trend={12}/>
            <KpiCard title="Won Deals"      value={s.won_leads||r.won_leads||0}             sub="closed"         icon={TrendingUp} color="emerald" trend={8}/>
            <KpiCard title="Agents Active"  value={s.active_agents||r.active_agents||0}     sub="sales team"     icon={Users}      color="blue"/>
          </div>
        </div>
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Operations</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Work Orders"    value={s.total_work_orders||0} sub="total"        icon={Wrench} color="amber"/>
            <KpiCard title="Completed"      value={s.completed_wos||0}     sub="this period"  icon={Wrench} color="emerald" trend={8}/>
            <KpiCard title="Technicians"    value={s.active_technicians||0}sub="active"       icon={Users}  color="emerald"/>
            <KpiCard title="Critical WOs"   value={s.critical_wos||0}      sub="urgent"       icon={Wrench} color={s.critical_wos>0?"red":"slate"}/>
          </div>
        </div>
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Inventory</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Items"    value={s.total_items||0}      sub="tracked"      icon={Package} color="amber"/>
            <KpiCard title="Low Stock"      value={s.low_stock_items||0}  sub="need reorder" icon={Package} color={s.low_stock_items>0?"red":"emerald"}/>
            <KpiCard title="Purchase Orders"value={s.total_pos||0}        sub="active"       icon={BarChart3} color="blue"/>
            <KpiCard title="Assets"         value={s.total_assets||0}     sub="tracked"      icon={Package} color="slate"/>
          </div>
        </div>
      </>)}

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">📊 Advanced Reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {["Lead Conversion Report","Work Order SLA Report","Agent Performance Report"].map(n=>(
            <div key={n} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <BarChart3 className="w-4 h-4 text-slate-400"/>
              <span className="text-sm text-slate-600">{n}</span>
              <span className="ml-auto text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded">Soon</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
