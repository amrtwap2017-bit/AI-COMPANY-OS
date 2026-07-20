"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { PageHeader, PageWrapper, LoadingState, EmptyState, SectionCard, AlertBanner } from "@/components/ui";
import { executiveApi } from "@/lib/api/enterprise";
import { AlertTriangle, Shield, RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";

export default function ExecutiveRisksPage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["executive-risks"],
    queryFn:  () => executiveApi.risks(),
    refetchInterval: 60_000,
  });

  const risks = data?.data?.risks || [];
  const score = data?.data?.risk_score || 0;

  const LEVEL_STYLE: Record<string,string> = {
    critical: "bg-red-50 border-red-200 text-red-700",
    high:     "bg-orange-50 border-orange-200 text-orange-700",
    medium:   "bg-amber-50 border-amber-200 text-amber-700",
    low:      "bg-slate-50 border-slate-200 text-slate-700",
  };

  return (
    <PageWrapper>
      <PageHeader title="Enterprise Risks" subtitle="Active risk signals across all domains" badge="RISK"
        actions={<button onClick={() => { refetch(); toast.success("Refreshed"); }} disabled={isFetching} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl"><RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} /></button>} />

      {isLoading ? <LoadingState type="cards" rows={3} cols={2} /> : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className={"rounded-2xl border p-5 " + (score > 50 ? "bg-red-50 border-red-200" : score > 25 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200")}>
              <AlertTriangle className={"w-5 h-5 mb-3 " + (score > 50 ? "text-red-600" : score > 25 ? "text-amber-600" : "text-emerald-600")} />
              <div className={"text-3xl font-bold " + (score > 50 ? "text-red-700" : score > 25 ? "text-amber-700" : "text-emerald-700")}>{score}</div>
              <div className="text-sm font-medium text-slate-600 mt-1">Risk Score</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <Shield className="w-5 h-5 mb-3 text-slate-400" />
              <div className="text-3xl font-bold text-slate-900">{risks.length}</div>
              <div className="text-sm font-medium text-slate-600 mt-1">Active Risks</div>
            </div>
          </div>

          {risks.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
              <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="font-semibold text-emerald-800">No active risks</p>
              <p className="text-sm text-emerald-600 mt-1">All systems operating normally</p>
            </div>
          ) : (
            <SectionCard title="Active Risk Items" subtitle={risks.length + " risks require attention"}>
              <div className="space-y-3">
                {risks.map((risk:any) => (
                  <div key={risk.id} className={"flex items-start gap-3 p-4 rounded-xl border " + (LEVEL_STYLE[risk.level] || LEVEL_STYLE.medium)}>
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{risk.title}</p>
                      <p className="text-xs opacity-70 mt-0.5 capitalize">Type: {risk.type} · Level: {risk.level}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/50 capitalize">{risk.level}</span>
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
