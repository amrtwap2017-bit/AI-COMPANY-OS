"use client";
// @ts-nocheck
"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, LoadingState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EntityTabs } from "@/components/ui/EntityTabs";
import { getStateColor } from "@/lib/hooks/useWorkflow";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { fmtDate } from "@/lib/design-tokens";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const FIELDS = [
        { label: "Title", key: "title" },
        { label: "Type", key: "type" },
        { label: "Priority", key: "priority" },
        { label: "Status", key: "status" },
        { label: "Due Date", key: "due_date" },
        { label: "Created", key: "created_at" },
];

function formatValue(key: string, val: any): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "number") {
    if (key.includes("value") || key.includes("amount") || key.includes("budget") || key.includes("price"))
      return "EGP " + val.toLocaleString();
    return String(val);
  }
  if (typeof val === "string") {
    if (val.length > 7 && val[4] === "-") return fmtDate(val);
    return val;
  }
  if (Array.isArray(val)) return val.join(", ");
  return String(val);
}

export default function DetailPage() {
  const params  = useParams();
  const id      = params?.id as string;

  const { data, isLoading, isError } = useQuery({
    queryKey:  ["-api-v1-work-orders", id],
    queryFn:   () => authFetchJSON("/api/v1/work-orders/" + id),
    enabled:   !!id,
    staleTime: 30_000,
    retry:     1,
  });

  if (isLoading) return <PageWrapper><LoadingState type="table" rows={6}/></PageWrapper>;
  
  if (isError || !data) {
    return (
      <PageWrapper>
        <AlertBanner type="error" title={"Record not found"}/>
        <Link href="/work-orders" className="flex items-center gap-2 text-sm text-amber-600 mt-4">
          <ArrowLeft className="w-4 h-4"/> Back to list
        </Link>
      </PageWrapper>
    );
  }

  const d: any = Array.isArray(data) ? data[0] : (data?.data || data);
  if (!d) return <PageWrapper><AlertBanner type="warning" title="No data found for this record"/></PageWrapper>;

  const title = d?.title || d?.name || d?.company_name || d?.quote_number || d?.contract_number || d?.invoice_number || d?.po_number || id?.slice(0,8) || "Record";
  const subtitle = d?.status ? "Status: " + d.status : "";

  const overview = (
    <div className="space-y-4">
      {d?.status && (
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
          <span className={"text-sm font-bold px-3 py-1.5 rounded-full capitalize " + getStateColor(d.status)}>
            {String(d.status).replace(/_/g," ")}
          </span>
          {d?.priority && (
            <span className={"text-sm font-bold px-3 py-1.5 rounded-full capitalize " + getStateColor(d.priority)}>
              {d.priority} priority
            </span>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map(({label, key}: any) => {
          const val = d?.[key];
          if (val === null || val === undefined) return null;
          return (
            <div key={key} className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="text-sm font-medium text-slate-900">{formatValue(key, val)}</p>
            </div>
          );
        })}
      </div>
      {(d?.description || d?.notes || d?.body) && (
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-2">Notes</p>
          <p className="text-sm text-slate-700 leading-relaxed">{d?.description || d?.notes || d?.body}</p>
        </div>
      )}
    </div>
  );

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader
        title={title}
        subtitle={subtitle}
        badge="WO"
        actions={
          <Link href="/work-orders"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4"/> Back
          </Link>
        }/>
      <EntityTabs tabs={[
        { id:"overview", label:"Overview", icon:"📋", content: overview },
      ]}/>
    </PageWrapper>
  );
}
