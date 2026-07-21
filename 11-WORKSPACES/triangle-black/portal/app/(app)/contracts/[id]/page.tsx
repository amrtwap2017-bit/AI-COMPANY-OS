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

export default function ContractDetailPage() {
  const { id } = useParams();
  const { data: contract, isLoading, isError } = useQuery({
    queryKey: ["contract", id],
    queryFn:  () => authFetchJSON("/api/v1/contracts/" + id),
    enabled:  !!id,
  });

  if (isLoading) return <PageWrapper><LoadingState type="table" rows={5}/></PageWrapper>;
  if (isError || !contract) return <PageWrapper><AlertBanner type="error" title="Contract not found"/></PageWrapper>;

  const c = Array.isArray(contract) ? contract[0] : contract;

  const overview = (
    <div className="grid grid-cols-2 gap-3">
      {[
        ["Contract #",  c?.contract_number||c?.id||"—"],
        ["Status",      <span className={"text-xs font-bold px-2.5 py-1 rounded-full "+getStateColor(c?.status||"active")}>{c?.status}</span>],
        ["Client",      c?.client_name||c?.customer_id||"—"],
        ["Value",       c?.total_value ? "EGP "+Number(c.total_value).toLocaleString() : "—"],
        ["Start Date",  c?.start_date ? fmtDate(c.start_date) : "—"],
        ["End Date",    c?.end_date ? fmtDate(c.end_date) : "—"],
        ["Type",        c?.contract_type||c?.type||"—"],
        ["Created",     c?.created_at ? fmtDate(c.created_at) : "—"],
      ].map(([label, value]: any) => (
        <div key={String(label)} className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1">{label}</p>
          <div className="text-sm font-medium text-slate-900">{value}</div>
        </div>
      ))}
    </div>
  );

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title={c?.contract_number||"Contract"} subtitle={c?.client_name||""} badge="CTR"
        actions={<Link href="/contracts" className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-4 h-4"/> Back</Link>}/>
      <EntityTabs tabs={[
        { id:"overview", label:"Overview", icon:"📋", content: overview },
      ]}/>
    </PageWrapper>
  );
}
