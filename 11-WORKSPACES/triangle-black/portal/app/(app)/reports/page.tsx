// @ts-nocheck
"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageWrapper, PageHeader, LoadingState } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { RefreshCw, TrendingUp, Wrench, Users, Package, BarChart3, ArrowUp, ArrowDown, Download } from "lucide-react";

function KpiCard({ title, value, sub, trend, color="amber" }:any) {
  const c:any = {
    amber:"bg-amber-50 border-amber-200",
    blue:"bg-blue-50 border-blue-200",
    emerald:"bg-emerald-50 border-emerald-200",
    red:"bg-red-50 border-red-200",
    slate:"bg-slate-50 border-slate-200",
  };
  return (
    <div className={"border rounded-2xl p-5 "+c[color]}>
      <div className="flex items-start justify-between mb-3">
        <BarChart3 className="w-5 h-5 opacity-50"/>
        {trend!==undefined&&(
          <span className={`text-xs font-bold flex items-center gap-0.5 ${trend>=0?"text-emerald-600":"text-red-500"}`}>
            {trend>=0?<ArrowUp className="w-3 h-3"/>:<ArrowDown className="w-3 h-3"/>}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="text-sm font-medium text-slate-700 mt-1">{title}</div>
      {sub&&<div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function BarChart({ data, title }:any) {
  if (!data?.length) return null;
  const max = Math.max(...data.map((d:any)=>d.value||0), 1);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.slice(0,8).map((item:any,i:number)=>(
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-28 truncate flex-shrink-0">{item.label}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-700 flex items-center justify-end pr-2"
                style={{width:Math.max(4,(item.value/max*100))+"%"}}>
                <span className="text-[10px] font-bold text-white">{item.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineChart({ stages }:any) {
  if (!stages?.length) return null;
  const total = stages.reduce((s:number,st:any)=>s+(st.count||0),0)||1;
  const COLORS = ["bg-purple-400","bg-blue-400","bg-amber-400","bg-emerald-500","bg-red-400"];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-4">Lead Pipeline Funnel</h3>
      <div className="flex gap-1 h-24 items-end mb-3">
        {stages.map((st:any,i:number)=>(
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
            <span className="text-xs font-bold text-slate-700">{st.count||0}</span>
            <div
              className={"rounded-t-lg w-full "+COLORS[i%COLORS.length]}
              style={{height:Math.max(8,(st.count||0)/total*80)+"%"}}/>
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        {stages.map((st:any,i:number)=>(
          <div key={i} className="flex-1 text-center">
            <p className="text-[10px] text-slate-500 capitalize">{st.stage||st.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const qc = useQueryClient();

  const { data: stats,   isLoading:l1 } = useQuery({ queryKey:["r-stats"],    queryFn:()=>authFetchJSON("/api/v1/actions/dashboard/stats"),         staleTime:60_000 });
  const { data: pipeline,isLoading:l2 } = useQuery({ queryKey:["r-pipeline"], queryFn:()=>authFetchJSON("/api/v1/actions/pipeline/summary"),         staleTime:60_000 });
  const { data: agents,  isLoading:l3 } = useQuery({ queryKey:["r-agents"],   queryFn:()=>authFetchJSON("/api/v1/actions/reports/agent-leaderboard"), staleTime:60_000 });
  const { data: ops,     isLoading:l4 } = useQuery({ queryKey:["r-ops"],      queryFn:()=>authFetchJSON("/api/v1/maintenance/dashboard"),            staleTime:60_000 });
  const { data: inv,     isLoading:l5 } = useQuery({ queryKey:["r-inv"],      queryFn:()=>authFetchJSON("/api/v1/actions/inventory/dashboard"),      staleTime:60_000 });

  const loading = l1||l2||l3||l4||l5;
  const s = stats||{};
  const p = pipeline||{};
  const o = ops||{};
  const iv= inv||{};

  const agentData = (agents?.agents||[]).slice(0,8).map((a:any)=>({
    label: a.name||"Agent",
    value: a.leads_count||a.won_count||0,
  }));

  const pipelineStages = Object.entries(p.by_status||{}).map(([stage,count])=>({stage, count: count as number}));

  function refresh() {
    ["r-stats","r-pipeline","r-agents","r-ops","r-inv"].forEach(k=>qc.invalidateQueries({queryKey:[k]}));
  }

  function exportReport() {
    const lines = [
      "Triangle Black — Operations Report",
      "Date: "+new Date().toLocaleDateString(),
      "",
      "COMMERCIAL",
      "Total Leads: "+(s.total_leads||p.total_leads||0),
      "Open Quotes: "+(s.open_quotes||0),
      "",
      "OPERATIONS",
      "Open Work Orders: "+(o.open_work_orders||0),
      "In Progress: "+(o.in_progress||0),
      "Completed: "+(o.completed||0),
      "",
      "INVENTORY",
      "Total Items: "+(iv.items||0),
      "Low Stock: "+(iv.low_stock_count||0),
    ];
    const csv = lines.join(String.fromCharCode(10));
    const blob = new window.Blob([csv],{type:"text/plain"});
    const url  = window.URL.createObjectURL(blob);
    const a    = window.document.createElement("a");
    a.href=url; a.download="operations-report-"+new Date().toISOString().slice(0,10)+".txt"; a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Reports & Analytics" subtitle="Live KPIs — all modules" badge="RPT"
        actions={
          <div className="flex gap-2">
            <button onClick={exportReport} className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200">
              <Download className="w-4 h-4"/> Export
            </button>
            <button onClick={refresh} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <RefreshCw className="h-4 w-4"/>
            </button>
          </div>
        }/>

      {loading?<LoadingState type="cards" rows={12} cols={4}/>:(<>
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Commercial</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Leads"    value={s.total_leads||p.total_leads||0}          sub="in pipeline"    color="blue"    trend={12}/>
            <KpiCard title="Open Quotes"    value={s.open_quotes||0}                         sub="pending review" color="amber"/>
            <KpiCard title="Won Deals"      value={p.by_status?.won||p.won_leads||0}         sub="closed"         color="emerald" trend={8}/>
            <KpiCard title="Pipeline Value" value={p.total_quote_value?"EGP "+Math.round((p.total_quote_value||0)/1000000)+"M":"—"} sub="total" color="amber"/>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Wrench className="w-4 h-4"/> Operations</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Open Work Orders"   value={o.open_work_orders||0}   sub="need attention" color="amber"/>
            <KpiCard title="In Progress"        value={o.in_progress||0}        sub="active"         color="blue"/>
            <KpiCard title="Completed"          value={o.completed||0}          sub="this period"    color="emerald" trend={5}/>
            <KpiCard title="Assets Tracked"     value={o.total_assets||0}       sub="in system"      color="slate"/>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Package className="w-4 h-4"/> Inventory</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Items"    value={iv.items||0}          sub="tracked"      color="blue"/>
            <KpiCard title="Warehouses"     value={iv.warehouses||0}     sub="active"       color="slate"/>
            <KpiCard title="Vendors"        value={iv.vendors||0}        sub="registered"   color="slate"/>
            <KpiCard title="Low Stock"      value={iv.low_stock_count||0} sub="need reorder" color={(iv.low_stock_count||0)>0?"red":"emerald"}/>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {agentData.length>0&&<BarChart data={agentData} title="Agent Performance — Leads"/>}
          {pipelineStages.length>0&&<PipelineChart stages={pipelineStages}/>}
        </div>
      </>)}
    </PageWrapper>
  );
}
