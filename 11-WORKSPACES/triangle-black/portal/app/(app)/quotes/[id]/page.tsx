// @ts-nocheck
"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertBanner, Breadcrumb, LoadingState, PageHeader, PageWrapper } from "@/components/ui";
import { EntityTabs } from "@/components/ui/EntityTabs";
import { getStateColor } from "@/lib/hooks/useWorkflow";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { fmtDate } from "@/lib/design-tokens";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function QuoteDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["quote", id],
    queryFn:  () => authFetchJSON("/api/v1/quotes/" + id),
    enabled:  !!id,
  });

  if (isLoading) return <PageWrapper><LoadingState type="table" rows={5}/></PageWrapper>;
  if (isError || !data) return <PageWrapper><AlertBanner type="error" title="Quote not found"/></PageWrapper>;

  const q = Array.isArray(data) ? data[0] : data;

  const overview = (
    <div className="grid grid-cols-2 gap-3">
      {[
        ["Quote #",      q?.quote_number||q?.id||"—"],
        ["Status",       <span className={"text-xs font-bold px-2.5 py-1 rounded-full "+getStateColor(q?.status||"draft")}>{q?.status}</span>],
        ["Lead",         q?.lead_id||"—"],
        ["Total Value",  q?.total_value ? "EGP "+Number(q.total_value).toLocaleString() : "—"],
        ["Valid Until",  q?.valid_until ? fmtDate(q.valid_until) : "—"],
        ["Created",      q?.created_at ? fmtDate(q.created_at) : "—"],
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
      <PageHeader title={q?.quote_number||"Quote"} subtitle={"Value: EGP "+(q?.total_value||0)} badge="QT"
        actions={<Link href="/quotes" className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-4 h-4"/> Back</Link>}/>
      <EntityTabs tabs={[{ id:"overview", label:"Overview", icon:"📋", content: overview }]}/>
    </PageWrapper>
  );
}
