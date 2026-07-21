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

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoice", id],
    queryFn:  () => authFetchJSON("/api/v1/invoices/" + id),
    enabled:  !!id,
  });

  if (isLoading) return <PageWrapper><LoadingState type="table" rows={5}/></PageWrapper>;
  if (isError || !data) return <PageWrapper><AlertBanner type="error" title="Invoice not found"/></PageWrapper>;

  const inv = Array.isArray(data) ? data[0] : data;

  const overview = (
    <div className="grid grid-cols-2 gap-3">
      {[
        ["Invoice #",    inv?.invoice_number||inv?.id||"—"],
        ["Status",       <span className={"text-xs font-bold px-2.5 py-1 rounded-full "+getStateColor(inv?.status||"draft")}>{inv?.status}</span>],
        ["Amount",       inv?.total_amount ? "EGP "+Number(inv.total_amount).toLocaleString() : "—"],
        ["Due Date",     inv?.due_date ? fmtDate(inv.due_date) : "—"],
        ["Issued",       inv?.issue_date ? fmtDate(inv.issue_date) : "—"],
        ["Contract",     inv?.contract_id||"—"],
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
      <PageHeader title={inv?.invoice_number||"Invoice"} subtitle={"EGP "+(inv?.total_amount||0)} badge="INV"
        actions={<Link href="/invoices" className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-4 h-4"/> Back</Link>}/>
      <EntityTabs tabs={[{ id:"overview", label:"Overview", icon:"📋", content: overview }]}/>
    </PageWrapper>
  );
}
