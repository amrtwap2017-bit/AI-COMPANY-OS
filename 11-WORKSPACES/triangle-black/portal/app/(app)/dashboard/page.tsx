"use client";
// @ts-nocheck
"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, LoadingState, AlertBanner } from "@/components/ui";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { getStateColor } from "@/lib/hooks/useWorkflow";
import { fmtDate } from "@/lib/design-tokens";
import {
  TrendingUp, Wrench, UserCheck, Package, AlertTriangle,
  ArrowRight, RefreshCw, CheckCircle2, Bell, Activity
} from "lucide-react";

function KPICard({ label, value, sub, color="amber", href }:any) {
  const c:any = {
    amber:   "border-l-amber-500  bg-amber-50  text-amber-600",
    blue:    "border-l-blue-500   bg-blue-50   text-blue-600",
    emerald: "border-l-emerald-500 bg-emerald-50 text-emerald-600",
    red:     "border-l-red-500    bg-red-50    text-red-600",
    slate:   "border-l-slate-300  bg-slate-50  text-slate-500",
  };
  const inner = (
    <div className={"border-l-4 rounded-2xl border border-slate-200 p-5 " + (c[color]||c.slate)}>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="text-sm font-medium text-slate-700 mt-1">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
  return href ? <Link href={href} className="block hover:shadow-md transition-shadow">{inner}</Link> : inner;
}

function SignalCard({ signal }:any) {
  const levelColors:any = {
    critical: "border-red-400 bg-red-50",
    high:     "border-amber-400 bg-amber-50",
    medium:   "border-blue-400 bg-blue-50",
    low:      "border-slate-300 bg-slate-50",
  };
  const icons:any = { critical: "🚨", high: "⚠️", medium: "ℹ️", low: "✅" };
  return (
    <Link href={signal.endpoint || "#"}
      className={"flex items-start gap-3 p-4 rounded-xl border-l-4 border border-slate-200 hover:shadow-sm transition-all " + (levelColors[signal.level]||levelColors.low)}>
      <span className="text-xl flex-shrink-0">{icons[signal.level]||"ℹ️"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{signal.title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{signal.action}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5"/>
    </Link>
  );
}

export default function DashboardPage() {
  const { authFetchJSON: fetchJSON } = { authFetchJSON: authFetchJSON };
  const [lastTs, setLastTs] = useState(new Date());

  const { data: stats,   refetch: refetchStats,   isFetching: f1 } = useQuery({
    queryKey: ["dash-stats"],
    queryFn:  () => authFetchJSON("/api/v1/actions/dashboard/stats"),
    staleTime: 60_000,
  });
  const { data: pipeline } = useQuery({
    queryKey: ["dash-pipeline"],
    queryFn:  () => authFetchJSON("/api/v1/actions/pipeline/summary"),
    staleTime: 60_000,
  });
  const { data: signalsRaw } = useQuery({
    queryKey: ["dash-signals"],
    queryFn:  () => authFetchJSON("/api/v1/tb-ai/signals"),
    staleTime: 30_000,
    retry: 1,
  });
  const { data: leadsRaw } = useQuery({
    queryKey: ["dash-leads"],
    queryFn:  () => authFetchJSON("/api/v1/actions/leads/search?limit=5"),
    staleTime: 60_000,
  });
  const { data: wosRaw } = useQuery({
    queryKey: ["dash-wos"],
    queryFn:  () => authFetchJSON("/api/v1/work-orders?limit=5"),
    staleTime: 60_000,
  });

  const s       = stats    || {};
  const p       = pipeline || {};
  const signals = Array.isArray(signalsRaw?.signals) ? signalsRaw.signals : [];
  const leads   = Array.isArray(leadsRaw?.results) ? leadsRaw.results : (Array.isArray(leadsRaw) ? leadsRaw : []);
  const wos     = Array.isArray(wosRaw) ? wosRaw : wosRaw?.items || [];

  function refresh() {
    refetchStats();
    setLastTs(new Date());
  }

  const STATUS_C:any = {
    new:"bg-purple-100 text-purple-700", qualified:"bg-blue-100 text-blue-700",
    negotiation:"bg-amber-100 text-amber-700", won:"bg-emerald-100 text-emerald-700", lost:"bg-red-100 text-red-700",
    open:"bg-blue-100 text-blue-700", in_progress:"bg-amber-100 text-amber-700",
    completed:"bg-emerald-100 text-emerald-700", critical:"bg-red-100 text-red-700",
  };

  return (
    <PageWrapper>
      <PageHeader title="Dashboard" badge="LIVE"
        subtitle={"Updated: "+lastTs.toLocaleTimeString()}
        actions={
          <button onClick={refresh} disabled={f1}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
            <RefreshCw className={`h-4 w-4 ${f1?"animate-spin":""}`}/> Refresh
          </button>
        }/>

      {/* AI Signals */}
      {signals.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-500"/> AI Signals ({signals.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {signals.map((sig:any) => <SignalCard key={sig.id} signal={sig}/>)}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Commercial Pipeline</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Total Leads"    value={s.total_leads||p.total_leads||0}    sub="in pipeline" color="blue"    href="/leads"/>
          <KPICard label="Open Quotes"    value={s.open_quotes||0}                   sub="pending"     color="amber"   href="/quotes"/>
          <KPICard label="Won Deals"      value={p.by_status?.won||0}               sub="closed"      color="emerald" href="/leads?tab=won"/>
          <KPICard label="Notifications"  value={s.unread_notifications||0}          sub="unread"      color="red"     href="/notifications"/>
        </div>
      </div>

      {/* Recent data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Recent Leads</h3>
            <Link href="/leads" className="text-xs text-amber-600 font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3"/>
            </Link>
          </div>
          {leads.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No leads</p>
          ) : (
            <div className="space-y-2">
              {leads.slice(0,5).map((l:any) => (
                <Link key={l.id} href={"/leads/"+l.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-amber-700">{l.company_name||l.name}</p>
                    <p className="text-xs text-slate-400">{l.contact_name}</p>
                  </div>
                  <span className={"text-[10px] px-2 py-0.5 rounded-full font-semibold "+(STATUS_C[l.status]||"bg-slate-100 text-slate-600")}>{l.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Active Work Orders</h3>
            <Link href="/work-orders" className="text-xs text-amber-600 font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3"/>
            </Link>
          </div>
          {wos.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No work orders</p>
          ) : (
            <div className="space-y-2">
              {wos.filter((w:any)=>["open","in_progress"].includes(w.status)).slice(0,5).map((w:any) => (
                <Link key={w.id} href={"/operations/work-orders/"+w.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-amber-700">{w.title}</p>
                    <p className="text-xs text-slate-400 capitalize">{(w.type||"maintenance").replace("_"," ")}</p>
                  </div>
                  <span className={"text-[10px] px-2 py-0.5 rounded-full font-semibold ml-2 "+getStateColor(w.priority||"medium")}>{w.priority}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {label:"New Work Order",  href:"/operations/work-orders/new", icon:Wrench},
          {label:"New Lead",        href:"/leads/new",                  icon:TrendingUp},
          {label:"Approvals",       href:"/approvals",                  icon:CheckCircle2},
          {label:"View Reports",    href:"/reports",                    icon:Package},
        ].map(item => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-sm transition-all group">
              <Icon className="w-5 h-5 text-slate-400 group-hover:text-amber-600"/>
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </PageWrapper>
  );
}
