"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState, StatusBadge } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { RefreshCw, Briefcase } from "lucide-react";
import { toast } from "@/lib/toast";
import { fmtCurrency, fmtDate } from "@/lib/design-tokens";

export default function ExecutivePortfolioPage() {
  const { data: portData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["exec-portfolio"],
    queryFn: async () => {
      const res = await authFetch("/api/v1/actions/executive/portfolio");
      if (!res.ok) return {};
      return res.json();
    },
    staleTime: 60_000,
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["portfolio-contracts"],
    queryFn: async () => {
      const res = await authFetch("/api/v1/contracts");
      if (!res.ok) return [];
      const d = await res.json();
      return Array.isArray(d) ? d : d?.items || [];
    },
    staleTime: 60_000,
  });

  const d = portData || {};
  const totalValue = contracts.reduce((s, c) => s + (c.total_value || 0), 0);
  const active = contracts.filter(c => c.status === "active");
  const activeValue = active.reduce((s, c) => s + (c.total_value || 0), 0);

  return (
    <PageWrapper>
      <PageHeader title="Executive Portfolio" subtitle="Contract portfolio and revenue base" badge="PORT"
        actions={
          <button onClick={() => { refetch(); toast.success("Refreshed"); }} disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        } />

      {isLoading ? <LoadingState type="cards" rows={4} cols={3} /> : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Contracts", value: contracts.length,       color: "bg-slate-50 border-slate-200 text-slate-900" },
              { label: "Active",          value: active.length,          color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
              { label: "Active Value",    value: fmtCurrency(activeValue), color: "bg-blue-50 border-blue-200 text-blue-700" },
              { label: "Total Portfolio", value: fmtCurrency(totalValue),  color: "bg-amber-50 border-amber-200 text-amber-700" },
            ].map(m => (
              <div key={m.label} className={"rounded-2xl border p-4 " + m.color}>
                <div className="text-xl font-bold">{m.value}</div>
                <div className="text-xs font-medium mt-1 opacity-80">{m.label}</div>
              </div>
            ))}
          </div>

          <SectionCard title="Active Contracts" subtitle={active.length + " active revenue-generating contracts"}>
            {active.length === 0
              ? <EmptyState icon="📋" title="No active contracts" description="Activate contracts to see portfolio" />
              : (
                <div className="space-y-2">
                  {active.slice(0, 15).map(c => (
                    <Link key={c.id} href={"/contracts/" + c.id}
                      className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-amber-300 hover:shadow-sm transition-all group">
                      <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 group-hover:text-amber-700 truncate">{c.title}</p>
                        <p className="text-xs text-slate-400">{c.duration_months || "—"} months · Ends {fmtDate(c.end_date)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-slate-900">{fmtCurrency(c.total_value || 0)}</p>
                        <StatusBadge status={c.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )
            }
          </SectionCard>
        </>
      )}
    </PageWrapper>
  );
}
