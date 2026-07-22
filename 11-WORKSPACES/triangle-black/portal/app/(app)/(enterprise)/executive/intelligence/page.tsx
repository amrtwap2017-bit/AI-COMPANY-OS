"use client";
// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, LoadingState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import Link from "next/link";
import { ArrowRight, TrendingUp, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

function SignalCard({ sig }:any) {
  const c:any = { critical:"bg-red-50 border-red-300 text-red-800", high:"bg-amber-50 border-amber-300 text-amber-800", medium:"bg-blue-50 border-blue-300 text-blue-800", low:"bg-slate-50 border-slate-300 text-slate-700" };
  const icons:any = { critical:"🚨", high:"⚠️", medium:"ℹ️", low:"✅" };
  return (
    <Link href={sig.endpoint||"#"} className={"flex items-start gap-3 p-4 rounded-xl border "+c[sig.level]+" hover:shadow-sm transition-all"}>
      <span className="text-xl">{icons[sig.level]}</span>
      <div className="flex-1">
        <p className="text-sm font-bold">{sig.title}</p>
        <p className="text-xs mt-0.5 opacity-75">{sig.action}</p>
      </div>
      <ArrowRight className="w-4 h-4 opacity-50 flex-shrink-0 mt-0.5"/>
    </Link>
  );
}

export default function ExecutiveIntelligencePage() {
  const { data: signals } = useQuery({
    queryKey: ["exec-signals"],
    queryFn:  () => authFetchJSON("/api/v1/tb-ai/signals"),
    staleTime: 30_000, retry:1,
  });
  const { data: exec } = useQuery({
    queryKey: ["exec-intel"],
    queryFn:  () => authFetchJSON("/api/v1/actions/executive/intelligence"),
    staleTime: 60_000,
  });
  const { data: daily } = useQuery({
    queryKey: ["exec-daily"],
    queryFn:  () => authFetchJSON("/api/v1/actions/executive/daily-review"),
    staleTime: 60_000,
  });
  const { data: alerts } = useQuery({
    queryKey: ["exec-alerts"],
    queryFn:  () => authFetchJSON("/api/v1/actions/executive/alerts/predictive"),
    staleTime: 60_000,
  });

  const sigs    = signals?.signals || [];
  const d       = daily || {};
  const e       = exec  || {};
  const alertList = alerts?.alerts || [];
  const critical  = sigs.filter((s:any)=>s.level==="critical").length;

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Executive Intelligence" subtitle={"AI-powered platform insights · "+critical+" critical"} badge="INTEL"
        actions={
          critical>0&&(
            <span className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl">
              <AlertTriangle className="w-4 h-4"/> {critical} Critical Alert{critical>1?"s":""}
            </span>
          )
        }/>

      {/* Daily review KPIs */}
      {(d.new_leads||d.new_wos) && (
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Today's Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {label:"New Leads Today",     val:d.new_leads||0,     icon:TrendingUp,   color:"blue"},
              {label:"New Work Orders",     val:d.new_wos||0,       icon:AlertTriangle, color:"amber"},
              {label:"Completed Today",     val:d.completed_wos||0, icon:CheckCircle2, color:"emerald"},
              {label:"SLA Compliance",      val:(d.sla_compliance||92)+"%", icon:Clock, color:"slate"},
            ].map(k=>{
              const Icon=k.icon;
              const c:any={blue:"bg-blue-50 text-blue-600",amber:"bg-amber-50 text-amber-600",emerald:"bg-emerald-50 text-emerald-600",slate:"bg-slate-100 text-slate-500"};
              return (
                <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className={"w-9 h-9 rounded-xl flex items-center justify-center mb-3 "+c[k.color]}>
                    <Icon className="w-4 h-4"/>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{k.val}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Signals */}
      {sigs.length>0&&(
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">AI Platform Signals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sigs.map((sig:any)=><SignalCard key={sig.id} sig={sig}/>)}
          </div>
        </div>
      )}

      {/* Predictive alerts */}
      {alertList.length>0&&(
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Predictive Alerts</h2>
          <div className="space-y-2">
            {alertList.slice(0,5).map((alert:any,i:number)=>(
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
                <span className="text-lg">⚡</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{alert.title||alert.message||"Alert"}</p>
                  {alert.recommendation&&<p className="text-xs text-slate-500 mt-0.5">{alert.recommendation}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hot deals + intel */}
      {(e.hot_deals||e.overdue_invoices)&&(
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {e.hot_deals?.slice(0,3).map((deal:any,i:number)=>(
            <div key={i} className="bg-white rounded-2xl border border-emerald-200 p-4">
              <p className="text-xs font-bold text-emerald-600 mb-2">🔥 Hot Deal</p>
              <p className="text-sm font-semibold text-slate-900">{deal.company_name||deal.name}</p>
              <p className="text-xs text-slate-500 mt-1">{"EGP "+(deal.quote_value||0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
