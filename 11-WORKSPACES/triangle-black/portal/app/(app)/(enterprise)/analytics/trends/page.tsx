"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "@/lib/toast";
import { fmtCurrency } from "@/lib/design-tokens";

export default function AnalyticsTrendsPage() {
  const { data: trends, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["analytics-trends"],
    queryFn: async () => {
      const res = await authFetch("/api/v1/analytics/trends");
      if (!res.ok) return {};
      return res.json();
    },
    staleTime: 60_000,
  });

  const { data: kpis } = useQuery({
    queryKey: ["analytics-kpis-trends"],
    queryFn: async () => {
      const res = await authFetch("/api/v1/analytics/kpis");
      if (!res.ok) return {};
      return res.json();
    },
    staleTime: 60_000,
  });

  const leadsT = (trends || {}).leads_trend || [];
  const wosT   = (trends || {}).work_orders_trend || [];
  const comm   = (kpis || {}).commercial || {};
  const ops    = (kpis || {}).operations || {};

  return (
    <PageWrapper>
      <PageHeader title="Analytics Trends" subtitle="Historical performance trends and comparisons" badge="TREND"
        actions={
          <button onClick={() => { refetch(); toast.success("Refreshed"); }} disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        } />

      {isLoading ? <LoadingState type="cards" rows={6} cols={2} /> : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Leads",       value: comm.total_leads || 0,       sub: "in pipeline",    color: "bg-blue-50 border-blue-200 text-blue-700" },
              { label: "Won Deals",         value: comm.won_leads || 0,         sub: "closed",         color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
              { label: "Conversion Rate",   value: (comm.conversion_rate || 0) + "%", sub: "lead to win", color: "bg-amber-50 border-amber-200 text-amber-700" },
              { label: "Revenue Collected", value: fmtCurrency(comm.revenue_collected || 0), sub: "EGP", color: "bg-slate-50 border-slate-200 text-slate-900" },
            ].map(m => (
              <div key={m.label} className={"rounded-2xl border p-4 " + m.color}>
                <div className="text-xl font-bold">{m.value}</div>
                <div className="text-xs font-medium mt-1 opacity-80">{m.label}</div>
                <div className="text-[10px] opacity-60 mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SectionCard title="Lead Trend" subtitle="Monthly lead volume">
              {leadsT.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">No trend data yet</div>
              ) : (
                <div className="space-y-2">
                  {leadsT.slice(0,6).map((row, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-20">{row.month ? String(row.month).slice(0,7) : "—"}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: (Math.min((row.count||0)/20*100,100)) + "%"}} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 w-8 text-right">{row.count || 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Work Order Trend" subtitle="Monthly WO volume">
              {wosT.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">No trend data yet</div>
              ) : (
                <div className="space-y-2">
                  {wosT.slice(0,6).map((row, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-20">{row.month ? String(row.month).slice(0,7) : "—"}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{width: (Math.min((row.count||0)/20*100,100)) + "%"}} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 w-8 text-right">{row.count || 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          <SectionCard title="Operations Performance">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total WOs",       value: ops.total_work_orders || 0 },
                { label: "Completed",       value: ops.completed_work_orders || 0 },
                { label: "Completion Rate", value: (ops.completion_rate || 0) + "%" },
                { label: "Active Techs",    value: ops.active_technicians || 0 },
              ].map(m => (
                <div key={m.label} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xl font-bold text-slate-900">{m.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      )}
    </PageWrapper>
  );
}
