// @ts-nocheck
"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { dashboardApi } from "@/lib/api/dashboard";
import { leadsApi } from "@/lib/api/leads";
import { PageHeader, LoadingState, AlertBanner } from "@/components/ui";
import {
  TrendingUp, Wrench, UserCheck, Package,
  ArrowRight, RefreshCw, AlertTriangle,
  CheckCircle2, Clock, BarChart3,
} from "lucide-react";

function Metric({ label, value, sub, color="amber", trend }: any) {
  const c: any = { amber:"text-amber-600 bg-amber-50", blue:"text-blue-600 bg-blue-50",
    emerald:"text-emerald-600 bg-emerald-50", red:"text-red-600 bg-red-50",
    slate:"text-slate-600 bg-slate-100" };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c[color]||c.amber}`}>
        <BarChart3 className="w-5 h-5"/>
      </div>
      <div className={`text-3xl font-bold ${color==="red"?"text-red-600":"text-slate-900"}`}>{value}</div>
      <div className="text-sm font-medium text-slate-700 mt-1">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

const STATUS_COLORS: any = {
  new:"bg-purple-100 text-purple-700", qualified:"bg-blue-100 text-blue-700",
  negotiation:"bg-amber-100 text-amber-700", won:"bg-emerald-100 text-emerald-700",
  lost:"bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const [stats,  setStats]  = useState<any>(null);
  const [leads,  setLeads]  = useState<any[]>([]);
  const [loading,setLoading]= useState(true);
  const [error,  setError]  = useState<string|null>(null);
  const [lastTs, setLastTs] = useState(new Date());

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [s, l] = await Promise.all([
        dashboardApi.getStats(),
        leadsApi.list({ limit: 5 }),
      ]);
      setStats(s);
      setLeads(l.data || []);
      setLastTs(new Date());
    } catch(e: any) { setError(e.message||"Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const t=setInterval(load,60000); return ()=>clearInterval(t); },[load]);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader title="Dashboard" badge="LIVE"
        subtitle={"Last updated: "+lastTs.toLocaleTimeString()}
        actions={
          <button onClick={load} disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
            <RefreshCw className={`h-4 w-4 ${loading?"animate-spin":""}`}/> Refresh
          </button>
        }/>

      {error && <AlertBanner type="error" title={error}/>}

      {loading && !stats ? <LoadingState type="cards" rows={4} cols={4}/> : (
        <>
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Commercial Pipeline</h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                {label:"Total Leads",   value:stats?.leads?.total||0,       color:"blue",    sub:"in pipeline"},
                {label:"New",           value:stats?.leads?.new||0,         color:"slate",   sub:"this period"},
                {label:"Qualified",     value:stats?.leads?.qualified||0,   color:"amber",   sub:"ready for proposal"},
                {label:"Negotiation",   value:stats?.leads?.negotiation||0, color:"amber",   sub:"active deals"},
                {label:"Won",           value:stats?.leads?.won||0,         color:"emerald", sub:"closed"},
              ].map(m=><Metric key={m.label} {...m}/>)}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Operations</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {label:"Open Work Orders",   value:stats?.workOrders?.open||0,      color:"amber",   sub:"need attention"},
                {label:"In Progress",        value:stats?.workOrders?.inProgress||0, color:"blue",    sub:"active"},
                {label:"Completed",          value:stats?.workOrders?.completed||0,  color:"emerald", sub:"this period"},
                {label:"Critical",           value:stats?.workOrders?.critical||0,   color:(stats?.workOrders?.critical||0)>0?"red":"slate", sub:"urgent"},
              ].map(m=><Metric key={m.label} {...m}/>)}
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Recent Leads</h3>
            <Link href="/leads" className="text-xs text-amber-600 font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3"/>
            </Link>
          </div>
          {loading && !leads.length ? <LoadingState type="table" rows={4}/> :
           leads.length === 0 ? (
             <div className="text-center py-8 text-slate-400">
               <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30"/>
               <p className="text-sm">No leads yet</p>
               <Link href="/leads/new" className="text-xs text-amber-600 mt-2 block hover:underline">+ Add Lead</Link>
             </div>
           ) : (
             <div className="space-y-2">
               {leads.map((lead: any) => (
                 <Link key={lead.id} href={`/leads/${lead.id}`}
                   className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                   <div>
                     <p className="font-medium text-sm text-slate-900 group-hover:text-amber-700">{lead.company_name||lead.name}</p>
                     <p className="text-xs text-slate-400">{lead.contact_name} · {lead.email}</p>
                   </div>
                   <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[lead.status]||"bg-slate-100 text-slate-600"}`}>
                     {lead.status}
                   </span>
                 </Link>
               ))}
             </div>
           )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              {label:"New Work Order",  href:"/operations/work-orders/new", icon:Wrench,    color:"amber"},
              {label:"New Lead",        href:"/leads/new",                  icon:TrendingUp,color:"blue"},
              {label:"Technicians",     href:"/technicians",                icon:UserCheck, color:"emerald"},
              {label:"Inventory",       href:"/inventory",                  icon:Package,   color:"slate"},
              {label:"Approvals",       href:"/approvals",                  icon:CheckCircle2,color:"emerald"},
              {label:"Reports",         href:"/reports",                    icon:BarChart3,  color:"amber"},
            ].map(item => {
              const Icon = item.icon;
              const c: any = {amber:"bg-amber-50 text-amber-600", blue:"bg-blue-50 text-blue-600",
                emerald:"bg-emerald-50 text-emerald-600", slate:"bg-slate-100 text-slate-600"};
              return (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-sm transition-all group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c[item.color]}`}>
                    <Icon className="w-4 h-4"/>
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
