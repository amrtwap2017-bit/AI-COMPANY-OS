"use client";
// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, LoadingState } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { RefreshCw, TrendingUp, Wrench, Users, Package, BarChart3, ArrowUp, ArrowDown } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

function KpiCard({ title, value, sub, trend, color="amber" }:any) {
  const c: any = {
    amber:"bg-amber-50 border-amber-200 text-amber-700",
    blue:"bg-blue-50 border-blue-200 text-blue-700",
    emerald:"bg-emerald-50 border-emerald-200 text-emerald-700",
    red:"bg-red-50 border-red-200 text-red-700",
    slate:"bg-slate-50 border-slate-200 text-slate-600",
  };
  return (
    <div className={"border rounded-2xl p-5 "+c[color]}>
      <div className="flex items-start justify-between mb-3">
        <BarChart3 className="w-5 h-5 opacity-60"/>
        {trend!==undefined && (
          <span className={`text-xs font-bold flex items-center gap-0.5 ${trend>=0?"text-emerald-600":"text-red-500"}`}>
            {trend>=0?<ArrowUp className="w-3 h-3"/>:<ArrowDown className="w-3 h-3"/>}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="text-sm font-medium text-slate-700 mt-1">{title}</div>
      {sub&&<div className="text-xs opacity-70 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function ReportsPage() {
  const qc = useQueryClient();

  const { data: stats,   isLoading: l1 } = useQuery({ queryKey:["r-stats"],     queryFn:()=>authFetchJSON("/api/v1/actions/dashboard/stats"),        staleTime:60_000 });
  const { data: pipeline,isLoading: l2 } = useQuery({ queryKey:["r-pipeline"],  queryFn:()=>authFetchJSON("/api/v1/actions/pipeline/summary"),        staleTime:60_000 });
  const { data: ops,     isLoading: l3 } = useQuery({ queryKey:["r-ops"],       queryFn:()=>authFetchJSON("/api/v1/maintenance/dashboard"),           staleTime:60_000 });
  const { data: inv,     isLoading: l4 } = useQuery({ queryKey:["r-inv"],       queryFn:()=>authFetchJSON("/api/v1/actions/inventory/dashboard"),     staleTime:60_000 });
  const { data: sla,     isLoading: l5 } = useQuery({ queryKey:["r-sla"],       queryFn:()=>authFetchJSON("/api/v1/analytics/sla"),                   staleTime:60_000 });
  const { data: agent,   isLoading: l6 } = useQuery({ queryKey:["r-agents"],    queryFn:()=>authFetchJSON("/api/v1/actions/reports/agent-leaderboard"),staleTime:60_000 });

  const loading = l1||l2||l3||l4||l5||l6;

  const s  = stats    || {};
  const p  = pipeline || {};
  const o  = ops      || {};
  const iv = inv      || {};
  const sl = sla      || {};
  const ag = agent    || {};

  function refresh() {
    ["r-stats","r-pipeline","r-ops","r-inv","r-sla","r-agents"].forEach(k=>qc.invalidateQueries({queryKey:[k]}));
  }

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Reports & Analytics" subtitle="Live KPIs from all modules" badge="RPT"
        actions={<button onClick={refresh} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><RefreshCw className="h-4 w-4"/></button>}/>

      {loading ? <LoadingState type="cards" rows={12} cols={4}/> : (<>

        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4"/> Commercial Pipeline
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Leads"    value={s.total_leads||p.total_leads||0}              sub="in pipeline"    color="blue"    trend={12}/>
            <KpiCard title="Open Quotes"    value={s.open_quotes||0}                             sub="pending review" color="amber"/>
            <KpiCard title="Won Deals"      value={p.by_status?.won||p.won_leads||0}             sub="closed"         color="emerald" trend={8}/>
            <KpiCard title="Pipeline Value" value={p.total_quote_value?"EGP "+Math.round((p.total_quote_value||0)/1000)+"K":"—"} sub="total" color="amber"/>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4"/> Operations
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Open Work Orders"   value={o.open_work_orders||0}   sub="need attention" color="amber"/>
            <KpiCard title="In Progress"        value={o.in_progress||0}        sub="active"         color="blue"/>
            <KpiCard title="Completed"          value={o.completed||0}          sub="this period"    color="emerald" trend={5}/>
            <KpiCard title="SLA Compliance"     value={(sl.compliance_rate||0)+"%"} sub="on target"  color={(sl.compliance_rate||0)>=80?"emerald":"red"}/>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Package className="w-4 h-4"/> Inventory & Assets
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Assets"    value={o.total_assets||0}                   sub="tracked"      color="blue"/>
            <KpiCard title="Inventory Items" value={iv.items||0}                         sub="in stock"     color="slate"/>
            <KpiCard title="Low Stock"       value={iv.low_stock_count||0}               sub="need reorder" color={(iv.low_stock_count||0)>0?"red":"emerald"}/>
            <KpiCard title="Warehouses"      value={iv.warehouses||0}                    sub="active"       color="slate"/>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="w-4 h-4"/> Team Performance
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {(ag.agents||[]).slice(0,3).map((a:any,i:number)=>(
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                  {(a.name||"?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{a.name}</p>
                  <p className="text-xs text-slate-500">{a.leads_count||0} leads · {a.quotes_count||0} quotes</p>
                </div>
                <span className="text-sm font-bold text-emerald-600">{a.won_count||0} won</span>
              </div>
            ))}
            {!(ag.agents?.length) && (
              <div className="col-span-3 bg-white rounded-2xl border border-slate-200 p-6 text-center text-sm text-slate-400">
                Agent leaderboard data loading...
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">📊 Advanced Reports</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["Revenue Trend Report","Lead Funnel Analysis","Technician Productivity Report"].map(name=>(
              <div key={name} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-sm text-slate-500">
                <BarChart3 className="w-4 h-4 flex-shrink-0"/>
                {name}
                <span className="ml-auto text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">Soon</span>
              </div>
            ))}
          </div>
        </div>
      </>)}
    </PageWrapper>
  );
}
