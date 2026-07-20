"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { PageHeader, PageWrapper, LoadingState, Progress, SectionCard } from "@/components/ui";
import { analyticsApi } from "@/lib/api/enterprise";
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "@/lib/toast";

export default function SLAPage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["analytics-sla-page"],
    queryFn:  () => analyticsApi.sla(),
    refetchInterval: 60_000,
  });

  const sla         = data?.data || {};
  const compliance  = Number(sla.compliance_rate  || 0);
  const target      = Number(sla.sla_target       || 95);
  const isCompliant = compliance >= target;

  const statusCls = isCompliant
    ? "flex items-center gap-3 p-4 rounded-xl bg-emerald-50"
    : "flex items-center gap-3 p-4 rounded-xl bg-red-50";

  const statusText = isCompliant
    ? "font-semibold text-emerald-800"
    : "font-semibold text-red-800";

  const statusSub = isCompliant
    ? "text-sm text-emerald-600"
    : "text-sm text-red-600";

  return (
    <PageWrapper>
      <PageHeader
        title="SLA Performance"
        subtitle="Service level agreement compliance and metrics"
        badge="SLA"
        actions={
          <button
            onClick={() => { refetch(); toast.success("Refreshed"); }}
            disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl"
          >
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        }
      />

      {isLoading ? (
        <LoadingState type="cards" rows={4} cols={2} />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={isCompliant ? "rounded-2xl border p-4 bg-emerald-50 border-emerald-200" : "rounded-2xl border p-4 bg-red-50 border-red-200"}>
              <div className={isCompliant ? "text-2xl font-bold text-emerald-700" : "text-2xl font-bold text-red-700"}>
                {compliance}%
              </div>
              <div className="text-xs font-medium mt-1 text-slate-600">Compliance Rate</div>
            </div>
            <div className="rounded-2xl border p-4 bg-slate-50 border-slate-200">
              <div className="text-2xl font-bold text-slate-700">{target}%</div>
              <div className="text-xs font-medium mt-1 text-slate-600">SLA Target</div>
            </div>
            <div className="rounded-2xl border p-4 bg-blue-50 border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{sla.total_work_orders || 0}</div>
              <div className="text-xs font-medium mt-1 text-slate-600">Total WOs</div>
            </div>
            <div className={(sla.critical_open || 0) > 0 ? "rounded-2xl border p-4 bg-red-50 border-red-200" : "rounded-2xl border p-4 bg-emerald-50 border-emerald-200"}>
              <div className={(sla.critical_open || 0) > 0 ? "text-2xl font-bold text-red-700" : "text-2xl font-bold text-emerald-700"}>
                {sla.critical_open || 0}
              </div>
              <div className="text-xs font-medium mt-1 text-slate-600">Critical Open</div>
            </div>
          </div>

          <SectionCard title="Compliance Overview">
            <div className="space-y-4">
              <div className={statusCls}>
                {isCompliant
                  ? <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  : <XCircle className="w-6 h-6 text-red-600" />
                }
                <div>
                  <p className={statusText}>
                    SLA Status: {sla.sla_status === "compliant" ? "Compliant" : "At Risk"}
                  </p>
                  <p className={statusSub}>
                    {compliance}% compliance vs {target}% target
                  </p>
                </div>
              </div>
              <Progress
                value={compliance}
                max={100}
                size="lg"
                label="Overall Compliance"
                showValue
                color={isCompliant ? "emerald" : "red"}
              />
            </div>
          </SectionCard>
        </>
      )}
    </PageWrapper>
  );
}
