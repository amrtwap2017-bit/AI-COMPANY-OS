"use client";
// @ts-nocheck
"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, LoadingState, AlertBanner, DataTable } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EntityTabs } from "@/components/ui/EntityTabs";
import { getStateColor } from "@/lib/hooks/useWorkflow";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import Link from "next/link";
import { ArrowLeft, UserCheck } from "lucide-react";

export default function TechnicianDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["technician", id],
    queryFn:  () => authFetchJSON("/api/v1/technicians/" + id),
    enabled:  !!id,
  });
  const { data: wos = [] } = useQuery({
    queryKey: ["tech-wos", id],
    queryFn:  () => authFetchJSON("/api/v1/technicians/" + id + "/work-orders"),
    enabled:  !!id,
  });

  if (isLoading) return <PageWrapper><LoadingState type="table" rows={5}/></PageWrapper>;
  if (isError || !data) return <PageWrapper><AlertBanner type="error" title="Technician not found"/></PageWrapper>;
  const t: any = Array.isArray(data) ? data[0] : data;
  const woList  = Array.isArray(wos) ? wos : wos?.items || [];

  const overview = (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
          <UserCheck className="w-7 h-7 text-amber-600"/>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t?.name}</h2>
          <p className="text-sm text-slate-500">{t?.email}</p>
          <span className={"text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 inline-block "+getStateColor(t?.is_active?"active":"inactive")}>
            {t?.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Phone",          t?.phone || "—"],
          ["Specialization", Array.isArray(t?.specializations) ? t.specializations.join(", ") : (t?.specializations || t?.role || "—")],
          ["Max Jobs",       t?.max_work_orders ?? "—"],
          ["Current Jobs",   t?.current_work_orders ?? t?.current_assignments ?? 0],
        ].map(([label, value]: any) => (
          <div key={label} className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-sm font-medium text-slate-900">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const woColumns = [
    { key:"title",    label:"Work Order", render:(r:any)=><span className="text-sm font-semibold text-slate-900">{r.title}</span> },
    { key:"status",   label:"Status",     render:(r:any)=><span className={"text-xs font-bold px-2 py-0.5 rounded-full "+getStateColor(r.status)}>{r.status}</span> },
    { key:"priority", label:"Priority",   render:(r:any)=><span className={"text-xs "+getStateColor(r.priority)}>{r.priority}</span> },
    { key:"due_date", label:"Due",        render:(r:any)=><span className="text-xs text-slate-500">{r.due_date ? new Date(r.due_date).toLocaleDateString() : "—"}</span> },
  ];

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title={t?.name || "Technician"} subtitle={"Field Engineer"} badge="TECH"
        actions={<Link href="/technicians" className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-4 h-4"/> Back</Link>}/>
      <EntityTabs tabs={[
        { id:"overview", label:"Overview",     icon:"👷", content: overview },
        { id:"wos",      label:"Work Orders",  icon:"🔧", badge: woList.length,
          content: woList.length === 0
            ? <p className="text-sm text-slate-400 text-center py-8">No work orders assigned</p>
            : <DataTable columns={woColumns} data={woList}/> },
      ]}/>
    </PageWrapper>
  );
}
