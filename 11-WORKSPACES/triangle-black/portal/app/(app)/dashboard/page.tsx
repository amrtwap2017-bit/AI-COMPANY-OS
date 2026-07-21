// @ts-nocheck
"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuthFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, LoadingState, AlertBanner } from "@/components/ui";
import { getStateColor } from "@/lib/hooks/useWorkflow";
import { TrendingUp, Wrench, UserCheck, Package, ArrowRight, RefreshCw, AlertTriangle } from "lucide-react";

function KPICard({ label, value, sub, color, href }: any) {
  const c: any = { amber:"border-l-amber-500 bg-amber-50 text-amber-700",
    blue:"border-l-blue-500 bg-blue-50 text-blue-700",
    emerald:"border-l-emerald-500 bg-emerald-50 text-emerald-700",
    red:"border-l-red-500 bg-red-50 text-red-700",
    slate:"border-l-slate-300 bg-slate-50 text-slate-600" };
  const card = (
    <div className={"border-l-4 rounded-2xl border border-slate-200 p-5 " + (c[color]||c.slate)}>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="text-sm font-medium text-slate-700 mt-1">{label}</div>
      {sub&&<div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
  return href ? <Link href={href} className="block hover:shadow-md transition-shadow">{card}</Link> : card;
}

export default function DashboardPage() {
  const { authFetchJSON } = useAuthFetch();
  const [stats,  setStats]  = useState<any>(null);
  const [leads,  setLeads]  = useState<any[]>([]);
  const [wos,    setWOs]    = useState<any[]>([]);
  const [loading,setLoading]= useState(true);
  const [error,  setError]  = useState<string|null>(null);
  const [ts,     setTs]     = useState(new Date());

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [s, l, w] = await Promise.all([
        authFetchJSON("/api/v1/actions/dashboard/stats"),
        authFetchJSON("/api/v1/actions/leads/search"),
        authFetchJSON("/api/v1/work-orders"),
      ]);
      setStats(s);
      setLeads(Array.isArray(l)?l:l?.results||l?.leads||[]);
      setWOs(Array.isArray(w)?w:w?.items||[]);
      setTs(new Date());
    } catch(e:any) { setError(e.message||"Failed"); }
    finally { setLoading(false); }
  },[authFetchJSON]);

  useEffect(()=>{ load(); const t=setInterval(load,60000); return ()=>clearInterval(t); },[load]);

  const kpis = [
    {label:"Total Leads",      value:stats?.total_leads||0,       sub:"in pipeline",     color:"blue",    href:"/leads"},
    {label:"Open Quotes",      value:stats?.open_quotes||0,        sub:"need attention",  color:"amber",   href:"/quotes"},
    {label:"Notifications",    value:stats?.unread_notifications||0,sub:"unread",         color:"red",     href:"/notifications"},
    {label:"Work Orders",      value:wos.filter((w:any)=>w.status==="open"||w.status==="in_progress").length, sub:"active", color:"emerald", href:"/work-orders"},
  ];

  const STATUS_COLORS: any = {
    new:"bg-purple-100 text-purple-700",qualified:"bg-blue-100 text-blue-700",
    negotiation:"bg-amber-100 text-amber-700",won:"bg-emerald-100 text-emerald-700",
    lost:"bg-red-100 text-red-700",
  };
  const PRIORITY: any = { critical:"text-red-600", high:"text-amber-600", medium:"text-blue-600", low:"text-slate-500" };

  return (
    <PageWrapper>
      <PageHeader title="Dashboard" badge="LIVE" subtitle={"Updated: "+ts.toLocaleTimeString()}
        actions={<button onClick={load} disabled={loading} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><RefreshCw className={`h-4 w-4 ${loading?"animate-spin":""}`}/></button>}/>
      {error&&<AlertBanner type="error" title={error}/>}
      {loading&&!stats?<LoadingState type="cards" rows={4} cols={4}/>:(
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map(k=><KPICard key={k.label} {...k}/>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Recent Leads</h3>
                <Link href="/leads" className="text-xs text-amber-600 font-semibold hover:underline flex items-center gap-1">View All<ArrowRight className="w-3 h-3"/></Link>
              </div>
              <div className="space-y-2">
                {leads.slice(0,5).map((l:any)=>(
                  <Link key={l.id} href={"/leads/"+l.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-amber-700">{l.company_name||l.name}</p>
                      <p className="text-xs text-slate-400">{l.contact_name}</p>
                    </div>
                    <span className={"text-[10px] px-2 py-0.5 rounded-full font-semibold "+(STATUS_COLORS[l.status]||"bg-slate-100 text-slate-600")}>{l.status}</span>
                  </Link>
                ))}
                {leads.length===0&&<p className="text-sm text-slate-400 text-center py-4">No leads yet</p>}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Active Work Orders</h3>
                <Link href="/work-orders" className="text-xs text-amber-600 font-semibold hover:underline flex items-center gap-1">View All<ArrowRight className="w-3 h-3"/></Link>
              </div>
              <div className="space-y-2">
                {wos.filter((w:any)=>["open","in_progress"].includes(w.status)).slice(0,5).map((w:any)=>(
                  <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{w.title}</p>
                      <p className={"text-xs font-medium "+(PRIORITY[w.priority]||"text-slate-500")}>{w.priority} priority</p>
                    </div>
                    <span className={"text-[10px] px-2 py-0.5 rounded-full font-semibold ml-2 "+getStateColor(w.status)}>{w.status?.replace("_"," ")}</span>
                  </div>
                ))}
                {wos.length===0&&<p className="text-sm text-slate-400 text-center py-4">No work orders</p>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {label:"New Work Order",href:"/operations/work-orders/new",icon:Wrench},
              {label:"Approvals",      href:"/approvals",                 icon:TrendingUp},
              {label:"Maintenance",    href:"/maintenance",               icon:Package},
              {label:"Field Team",     href:"/technicians",               icon:UserCheck},
            ].map(item=>{
              const Icon=item.icon;
              return <Link key={item.href} href={item.href} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-sm transition-all group">
                <Icon className="w-5 h-5 text-slate-400 group-hover:text-amber-600"/>
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </Link>;
            })}
          </div>
        </>
      )}
    </PageWrapper>
  );
}
