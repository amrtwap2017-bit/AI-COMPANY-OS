// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { CheckCircle, AlertCircle } from "lucide-react";

// Safe array extractor — handles all backend response shapes
const toArr = (d: any): any[] => {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d?.records)) return d.records;
  return [];
};


const PRIORITY_COLORS: Record<string, string> = {
  critical: "text-red-700 bg-red-50",
  high:     "text-amber-700 bg-amber-50",
  medium:   "text-blue-700 bg-blue-50",
  low:      "text-slate-600 bg-slate-50",
};

export default function SLAReviewPage() {
  const { data: overview = {}, isLoading: ol } = useQuery({
    queryKey: ["sla-overview"],
    queryFn: () => authFetch("/api/v1/sla/overview").then(r => r.json()),
    refetchInterval: 60000,
  });

  const { data: priority = {}, isLoading: pl } = useQuery({
    queryKey: ["sla-priority"],
    queryFn: () => authFetch("/api/v1/sla/by-priority").then(r => r.json()),
  });

  if (ol || pl) return <PageWrapper><LoadingState title="Loading SLA data..." /></PageWrapper>;

  const rate   = overview.completion_rate_pct ?? 0;
  const target = overview.sla_target_pct ?? 95;
  const ok     = overview.sla_status === "compliant";
  const rows   = priority?.by_priority ?? [];

  return (
    <PageWrapper>
      <PageHeader title="SLA Review" subtitle="Work order compliance tracking" badge="Program B" />

      {/* Status banner */}
      <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 border
        ${ok ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
        {ok ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
        <div>
          <div className="font-semibold">{ok ? "SLA Compliant" : "SLA At Risk"}</div>
          <div className="text-sm opacity-80">
            {rate}% completion rate · target {target}%
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        {[
          { label: "Total WOs",          value: overview.total_work_orders ?? 0,    color: "text-slate-700" },
          { label: "Completion Rate",    value: `${rate}%`,                          color: ok ? "text-emerald-600" : "text-red-600" },
          { label: "SLA Breached",       value: overview.sla_breached ?? 0,          color: "text-red-600" },
          { label: "Avg Resolution (h)", value: overview.avg_resolution_hours ?? 0,  color: "text-blue-600" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-xs text-slate-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <SectionCard title="SLA Completion Progress">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-slate-600">Current: <strong>{rate}%</strong></span>
          <span className="text-slate-400">Target: {target}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4 relative">
          <div className={`h-4 rounded-full transition-all ${ok ? "bg-emerald-500" : "bg-red-500"}`}
               style={{ width: `${Math.min(rate, 100)}%` }} />
          <div className="absolute top-0 h-4 border-l-2 border-dashed border-slate-400"
               style={{ left: `${target}%` }} />
        </div>
        <div className="text-xs text-slate-400 mt-1">
          {overview.critical_open ?? 0} critical WOs still open
        </div>
      </SectionCard>

      {/* Priority table */}
      <SectionCard title="By Priority">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-100">
                <th className="text-left py-2 font-medium">Priority</th>
                <th className="text-right py-2 font-medium">Total</th>
                <th className="text-right py-2 font-medium">Completed</th>
                <th className="text-right py-2 font-medium">Rate %</th>
                <th className="text-right py-2 font-medium">Avg Hours</th>
              </tr>
            </thead>
            <tbody>
              {toArr(rows).map((r: any) => (
                <tr key={r.priority} className="border-b border-slate-50">
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize
                      ${PRIORITY_COLORS[r.priority] ?? "bg-gray-100 text-gray-600"}`}>
                      {r.priority}
                    </span>
                  </td>
                  <td className="py-2 text-right text-slate-700">{r.total}</td>
                  <td className="py-2 text-right text-slate-700">{r.completed}</td>
                  <td className={`py-2 text-right font-semibold
                    ${r.completion_rate_pct >= 95 ? "text-emerald-600" : "text-red-600"}`}>
                    {r.completion_rate_pct}%
                  </td>
                  <td className="py-2 text-right text-slate-500">{r.avg_resolution_hours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </PageWrapper>
  );
}
