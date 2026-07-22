"use client"; // @ts-nocheck
// @ts-nocheck
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

export default function DetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["-api-v1-customers", id],
    queryFn:  () => authFetchJSON("/api/v1/customers" + (id ? "/" + id : "")),
    enabled:  !!id, staleTime: 30_000,
  });
  if (isLoading) return <PageWrapper><LoadingState type="table" rows={5}/></PageWrapper>;
  if (isError || !data) return <PageWrapper><AlertBanner type="error" title="Record not found"/></PageWrapper>;
  const d: any = Array.isArray(data) ? data[0] : data;
  const overview = (
    <div className="grid grid-cols-2 gap-3">
      {([
        ["Name", d?.name ?? "—"],
        ["Email", d?.email ?? "—"],
        ["Phone", d?.phone ?? "—"],
        ["Hotel", d?.hotel_id ?? "—"],
        ["Status", d?.status ?? "—"],
        ["Health", d?.health_score ?? "—"],
        ["Created", d?.created_at ?? "—"],
        ["Updated", d?.updated_at ?? "—"],
      ] as [string,any][]).map(([label, value]) => (
        <div key={label} className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1">{label}</p>
          <div className="text-sm font-medium text-slate-900">
            {typeof value === "string" && value.match(/^\d{4}/)
              ? fmtDate(value)
              : value ?? "—"}
          </div>
        </div>
      ))}
    </div>
  );
  const name = d?.name || d?.title || d?.company_name || d?.invoice_number || id;
  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title={String(name)} subtitle={"Customer Detail"} badge="CX"
        actions={
          <div className="flex gap-2">
            <Link href="/customers" className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="w-4 h-4"/> Back
            </Link>
          </div>
        }/>
      <EntityTabs tabs={[{ id:"overview", label:"Overview", icon:"📋", content: overview }]}/>
    </PageWrapper>
  );
}
