"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { PageHeader, PageWrapper, LoadingState, SectionCard, AlertBanner } from "@/components/ui";
import { executiveApi } from "@/lib/api/enterprise";
import { fmtDate } from "@/lib/design-tokens";
import { TrendingUp, AlertTriangle, Briefcase, RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";

export default function ExecutiveIntelligencePage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["executive-intelligence"],
    queryFn:  () => executiveApi.intelligence(),
    refetchInterval: 60_000,
  });

  const intel = data?.data || {};
  const hotDeals    = intel.hot_deals    || [];
  const signals     = intel.signals      || [];

  return (
    <PageWrapper>
      <PageHeader title="Executive Intelligence" subtitle="AI-powered signals and enterprise insights" badge="AI"
        actions={<button onClick={() => { refetch(); toast.success("Refreshed"); }} disabled={isFetching} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl"><RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} /></button>} />

      {isError && <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed"} />}

      {isLoading ? <LoadingState type="cards" rows={3} cols={3} /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: TrendingUp,   label: "Hot Deals",          value: hotDeals.length,        color: "bg-amber-50 border-amber-200 text-amber-700" },
              { icon: AlertTriangle,label: "Overdue Invoices",   value: intel.overdue_invoices || 0, color: intel.overdue_invoices > 0 ? "bg-red-50 border-red-200 text-red-700" : "bg-slate-50 border-slate-200 text-slate-700" },
              { icon: Briefcase,    label: "Critical Operations", value: intel.critical_ops || 0, color: intel.critical_ops > 0 ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-slate-50 border-slate-200 text-slate-700" },
            ].map(m => { const Icon = m.icon; return (
              <div key={m.label} className={"rounded-2xl border p-5 " + m.color}>
                <Icon className="w-5 h-5 mb-3 opacity-70" />
                <div className="text-2xl font-bold">{m.value}</div>
                <div className="text-sm font-medium mt-1 opacity-80">{m.label}</div>
              </div>
            ); })}
          </div>

          {signals.length > 0 && (
            <SectionCard title="Intelligence Signals" subtitle="AI-generated insights from your data">
              <div className="space-y-3">
                {signals.filter(Boolean).map((s:any, i:number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className={"w-2 h-2 rounded-full mt-1.5 flex-shrink-0 " + (s.type === "deal" ? "bg-amber-500" : s.type === "financial" ? "bg-red-500" : "bg-blue-500")} />
                    <p className="text-sm text-slate-700">{s.message}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {hotDeals.length > 0 && (
            <SectionCard title="Hot Deals" subtitle="Leads in negotiation stage requiring attention">
              <div className="space-y-2">
                {hotDeals.map((deal:any) => (
                  <div key={deal.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{deal.company || deal.company_name || deal.name}</p>
                      <p className="text-xs text-slate-500">{deal.contact_name || deal.email || ""}</p>
                    </div>
                    <span className="text-xs font-semibold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full capitalize">{deal.status}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </>
      )}
    </PageWrapper>
  );
}
