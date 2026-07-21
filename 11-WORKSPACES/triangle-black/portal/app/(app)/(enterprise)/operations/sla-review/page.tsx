"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, LoadingState, Progress } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "@/lib/toast";

export default function SLAReviewPage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["sla-review"],
    queryFn: async () => {
      const res = await authFetch("/api/v1/analytics/sla");
      if (!res.ok) return {};
      return res.json();
    },
    refetchInterval: 60_000,
  });

  const sla = data || {};
  const compliance = Number(sla.compliance_rate || 0);
  const target = Number(sla.sla_target || 95);
  const isCompliant = compliance >= target;

  return (
    <PageWrapper>
      <PageHeader
        title="SLA Review"
        subtitle="Service level agreement compliance monitoring"
        badge="SLA"
        actions={
          <button onClick={() => { refetch(); toast.success("Refreshed"); }} disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        }
      />

      {isLoading ? <LoadingState type="cards" rows={4} cols={2} /> : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Compliance Rate", value: compliance + "%", color: isCompliant ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700" },
              { label: "SLA Target",      value: target + "%",     color: "bg-slate-50 border-slate-200 text-slate-700" },
              { label: "Total WOs",       value: sla.total_work_orders || 0, color: "bg-blue-50 border-blue-200 text-blue-700" },
              { label: "Critical Open",   value: sla.critical_open || 0, color: (sla.critical_open || 0) > 0 ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700" },
            ].map(m => (
              <div key={m.label} className={"rounded-2xl border p-4 " + m.color}>
                <div className="text-2xl font-bold">{m.value}</div>
                <div className="text-xs font-medium mt-1 opacity-80">{m.label}</div>
              </div>
            ))}
          </div>

          <SectionCard title="Compliance Overview">
            <div className="space-y-4">
              <div className={isCompliant ? "flex items-center gap-3 p-4 rounded-xl bg-emerald-50" : "flex items-center gap-3 p-4 rounded-xl bg-red-50"}>
                {isCompliant ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <XCircle className="w-6 h-6 text-red-600" />}
                <div>
                  <p className={isCompliant ? "font-semibold text-emerald-800" : "font-semibold text-red-800"}>
                    Status: {sla.sla_status === "compliant" ? "Compliant" : "At Risk"}
                  </p>
                  <p className={isCompliant ? "text-sm text-emerald-600" : "text-sm text-red-600"}>
                    {compliance}% vs {target}% target
                  </p>
                </div>
              </div>
              <Progress value={compliance} max={100} size="lg" label="Overall Compliance" showValue
                color={isCompliant ? "emerald" : "red"} />
            </div>
          </SectionCard>
        </>
      )}
    </PageWrapper>
  );
}
