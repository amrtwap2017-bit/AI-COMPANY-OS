// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { analyticsApi } from "@/lib/api/enterprise";
import { PageHeader, LoadingState, AlertBanner, SectionCard } from "@/components/ui";
import { PageWrapper } from "@/components/ui";
import { RefreshCw, TrendingUp, Wrench, Users, BarChart3, Target, CheckCircle2 } from "lucide-react";
import { fmtCurrency } from "@/lib/design-tokens";

function KpiTile({ label, value, sub, color="amber", trend }: any) {
  const c: Record<string,string> = {
    amber:"bg-amber-50 text-amber-700 border-amber-100",
    blue:"bg-blue-50 text-blue-700 border-blue-100",
    emerald:"bg-emerald-50 text-emerald-700 border-emerald-100",
    red:"bg-red-50 text-red-700 border-red-100",
    slate:"bg-white text-slate-900 border-slate-200",
  };
  return (
    <div className={"rounded-2xl border p-5 " + (c[color] || c.slate)}>
      <div className="text-3xl font-bold">{value ?? "—"}</div>
      <div className="text-sm font-medium mt-1">{label}</div>
      {sub && <div className="text-xs opacity-70 mt-0.5">{sub}</div>}
      {trend !== undefined && (
        <div className={"text-xs font-semibold mt-2 " + (trend > 0 ? "text-emerald-600" : "text-red-500")}>
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { data: kpiData, isLoading: kLoading, refetch, isFetching } = useQuery({
    queryKey: ["analytics-kpis"],
    queryFn:  () => analyticsApi.kpis(),
    refetchInterval: 60_000,
  });

  const { data: slaData, isLoading: sLoading } = useQuery({
    queryKey: ["analytics-sla"],
    queryFn:  () => analyticsApi.sla(),
  });

  const { data: scoreData } = useQuery({
    queryKey: ["analytics-scorecards"],
    queryFn:  () => analyticsApi.scorecards(),
  });

  const kpis = kpiData?.data || {};
  const comm = kpis.commercial || {};
  const ops  = kpis.operations  || {};
  const sla  = slaData?.data    || {};
  const scorecards = scoreData?.data?.scorecards || [];

  const isLoading = kLoading || sLoading;

  return (
    <PageWrapper>
      <PageHeader
        title="Analytics Platform"
        subtitle="Live KPIs from all enterprise modules"
        badge="KPI"
        actions={
          <button onClick={() => refetch()} disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        } />

      {isLoading ? <LoadingState type="cards" rows={8} cols={4} /> : (
        <>
          {/* Commercial */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" /> Commercial Pipeline
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiTile label="Total Leads"      value={comm.total_leads}       sub="in pipeline"    color="blue" />
              <KpiTile label="Won Deals"        value={comm.won_leads}         sub="closed"         color="emerald" />
              <KpiTile label="Conversion Rate"  value={(comm.conversion_rate ?? 0) + "%"} sub="lead to win" color="amber" />
              <KpiTile label="Active Contracts" value={comm.active_contracts}  sub="revenue base"   color="slate" />
            </div>
          </div>

          {/* Operations */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Wrench className="w-3.5 h-3.5" /> Operations
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiTile label="Total Work Orders"     value={ops.total_work_orders}     sub="all time"    color="slate" />
              <KpiTile label="Completed"             value={ops.completed_work_orders}  sub="finished"    color="emerald" />
              <KpiTile label="Completion Rate"       value={(ops.completion_rate ?? 0) + "%"} sub="target 85%" color="amber" />
              <KpiTile label="Active Technicians"    value={ops.active_technicians}     sub="on roster"   color="blue" />
            </div>
          </div>

          {/* SLA */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Target className="w-3.5 h-3.5" /> SLA Performance
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiTile label="Compliance Rate" value={(sla.compliance_rate ?? 0) + "%"}
                sub={"Target: " + (sla.sla_target ?? 95) + "%"}
                color={(sla.compliance_rate ?? 0) >= 95 ? "emerald" : "red"} />
              <KpiTile label="Critical Open"   value={sla.critical_open}   sub="urgent" color={sla.critical_open > 0 ? "red" : "emerald"} />
              <KpiTile label="SLA Status" value={sla.sla_status === "compliant" ? "Compliant" : "At Risk"}
                sub={sla.sla_status} color={sla.sla_status === "compliant" ? "emerald" : "red"} />
              <KpiTile label="Total WOs Tracked" value={sla.total_work_orders} sub="in SLA scope" color="slate" />
            </div>
          </div>

          {/* Scorecards */}
          {scorecards.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enterprise Scorecards
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scorecards.map((sc: any) => (
                  <div key={sc.domain} className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-slate-900">{sc.domain}</p>
                      <span className={"text-sm font-bold " + (sc.score >= sc.target ? "text-emerald-600" : "text-amber-600")}>
                        {sc.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={"h-2 rounded-full " + (sc.score >= sc.target ? "bg-emerald-500" : "bg-amber-500")}
                        style={{width: Math.min(sc.score, 100) + "%"}} />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">{sc.label} · Target: {sc.target}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[{label:"Scorecards",href:"/analytics/scorecards"},{label:"SLA Reports",href:"/analytics/sla"}].map(l => (
              <Link key={l.href} href={l.href}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-amber-300 hover:shadow-sm transition-all text-center">
                <p className="font-semibold text-sm text-slate-900">{l.label}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </PageWrapper>
  );
}
