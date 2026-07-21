"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { RefreshCw, BarChart3, TrendingUp, Wrench, Download } from "lucide-react";
import { toast } from "@/lib/toast";
import { fmtCurrency } from "@/lib/design-tokens";

export default function ExecutiveReportsPage() {
  const { data: dash, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["exec-reports-dash"],
    queryFn: async () => {
      const res = await authFetch("/api/v1/actions/reports/dashboard");
      if (!res.ok) return {};
      return res.json();
    },
    staleTime: 60_000,
  });

  const { data: kpis } = useQuery({
    queryKey: ["exec-reports-kpis"],
    queryFn: async () => {
      const res = await authFetch("/api/v1/analytics/kpis");
      if (!res.ok) return {};
      return res.json();
    },
    staleTime: 60_000,
  });

  const { data: sla } = useQuery({
    queryKey: ["exec-reports-sla"],
    queryFn: async () => {
      const res = await authFetch("/api/v1/analytics/sla");
      if (!res.ok) return {};
      return res.json();
    },
    staleTime: 60_000,
  });

  const d = dash || {};
  const comm = (kpis || {}).commercial || {};
  const ops  = (kpis || {}).operations || {};
  const s    = sla || {};

  const REPORTS = [
    { title: "Revenue Trend Report",     desc: "Monthly revenue collection vs target",   icon: TrendingUp,  available: true },
    { title: "Lead Conversion Report",   desc: "Pipeline funnel and win rate analysis",  icon: BarChart3,   available: true },
    { title: "SLA Compliance Report",    desc: "Work order SLA performance by hotel",    icon: Wrench,      available: true },
    { title: "Technician Performance",   desc: "Field team productivity and workload",   icon: BarChart3,   available: false },
    { title: "Asset Reliability Report", desc: "MTBF and downtime analysis by asset",    icon: Wrench,      available: false },
    { title: "Contract Portfolio Report",desc: "Active contracts value and expiry",       icon: TrendingUp,  available: false },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Executive Reports" subtitle="Business intelligence and performance reports" badge="RPT"
        actions={
          <button onClick={() => { refetch(); toast.success("Refreshed"); }} disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        } />

      {isLoading ? <LoadingState type="cards" rows={6} cols={3} /> : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Leads",     value: comm.total_leads || d.total_leads || 0,       color: "bg-blue-50 border-blue-200 text-blue-700" },
              { label: "Won Deals",       value: comm.won_leads || d.won_leads || 0,           color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
              { label: "SLA Compliance",  value: (s.compliance_rate || 0) + "%",               color: (s.compliance_rate||0) >= 95 ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700" },
              { label: "Active Contracts",value: comm.active_contracts || 0,                   color: "bg-amber-50 border-amber-200 text-amber-700" },
            ].map(m => (
              <div key={m.label} className={"rounded-2xl border p-4 " + m.color}>
                <div className="text-2xl font-bold">{m.value}</div>
                <div className="text-xs font-medium mt-1 opacity-80">{m.label}</div>
              </div>
            ))}
          </div>

          <SectionCard title="Available Reports" subtitle="Download or view business intelligence reports">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REPORTS.map(r => {
                const Icon = r.icon;
                return (
                  <div key={r.title} className={"flex items-start gap-3 p-4 rounded-xl border transition-all " + (r.available ? "bg-white border-slate-200 hover:border-amber-300 cursor-pointer" : "bg-slate-50 border-slate-200 opacity-60")}>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900">{r.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
                    </div>
                    {r.available
                      ? <Download className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      : <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded flex-shrink-0">Soon</span>
                    }
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </>
      )}
    </PageWrapper>
  );
}
