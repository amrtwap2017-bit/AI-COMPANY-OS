"use client";
// @ts-nocheck
"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, LoadingState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EntityTabs } from "@/components/ui/EntityTabs";
import { getStateColor } from "@/lib/hooks/useWorkflow";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { fmtDate } from "@/lib/design-tokens";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PMPlan360Page() {
  const params = useParams();
  const id     = params?.id as string;

  const { data, isLoading, isError } = useQuery({
    queryKey:  ["pm-plan", id],
    queryFn:   () => authFetchJSON("/api/v1/maintenance/pm-plans/" + (id || "")),
    enabled:   !!id,
    staleTime: 30_000,
  });

  if (isLoading) return <PageWrapper><LoadingState type="table" rows={5}/></PageWrapper>;

  if (isError || !data) {
    return (
      <PageWrapper>
        <AlertBanner type="error" title="PM Plan not found"/>
        <Link href="/maintenance/pm-plans" className="text-sm text-amber-600 mt-4 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4"/> Back to PM Plans
        </Link>
      </PageWrapper>
    );
  }

  const p: any = Array.isArray(data) ? data[0] : (data?.data || data);

  const overview = (
    <div className="grid grid-cols-2 gap-3">
      {[
        ["Title",       p?.title],
        ["Frequency",   p?.frequency],
        ["Status",      p?.status],
        ["Asset",       p?.asset_id],
        ["Next Due",    p?.next_due_date ? fmtDate(p.next_due_date) : "—"],
        ["Created",     p?.created_at   ? fmtDate(p.created_at)    : "—"],
      ].map(([label, value]: any) => (
        <div key={label} className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1">{label}</p>
          <p className="text-sm font-medium text-slate-900 capitalize">
            {value ? String(value).replace(/_/g," ") : "—"}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader
        title={p?.title || "PM Plan"}
        subtitle={"Frequency: " + (p?.frequency || "—")}
        badge="PM"
        actions={
          <Link href="/maintenance/pm-plans"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
            <ArrowLeft className="w-4 h-4"/> Back
          </Link>
        }/>
      <EntityTabs tabs={[
        { id:"overview", label:"Overview", icon:"📋", content: overview },
      ]}/>
    </PageWrapper>
  );
}
