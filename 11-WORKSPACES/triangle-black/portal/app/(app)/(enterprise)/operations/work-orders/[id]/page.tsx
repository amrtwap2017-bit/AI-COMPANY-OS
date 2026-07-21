// @ts-nocheck
"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, LoadingState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EntityTabs } from "@/components/ui/EntityTabs";
import { WorkflowBar } from "@/components/ui/WorkflowBar";
import { getStateColor, useWorkflow } from "@/lib/hooks/useWorkflow";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { fmtDate } from "@/lib/design-tokens";
import Link from "next/link";
import { ArrowLeft, Wrench, Calendar, User, MapPin, Clock } from "lucide-react";

const WO_TRANSITIONS = [
  { from:"draft",         to:"submitted",    label:"Submit" },
  { from:"submitted",     to:"approved",     label:"Approve" },
  { from:"submitted",     to:"rejected",     label:"Reject" },
  { from:"approved",      to:"assigned",     label:"Assign" },
  { from:"assigned",      to:"in_progress",  label:"Start Work" },
  { from:"in_progress",   to:"inspection",   label:"Send for Inspection" },
  { from:"in_progress",   to:"waiting_parts",label:"Waiting Parts" },
  { from:"waiting_parts", to:"in_progress",  label:"Parts Arrived" },
  { from:"inspection",    to:"completed",    label:"Complete" },
  { from:"completed",     to:"closed",       label:"Close" },
];

export default function WorkOrderDetailPage() {
  const { id } = useParams();

  const { data: wo, isLoading, isError, error, refetch } = useQuery({
    queryKey:  ["work-order", id],
    queryFn:   () => authFetchJSON("/api/v1/work-orders/" + id),
    staleTime: 30_000, enabled: !!id,
  });

  const { data: history = [] } = useQuery({
    queryKey: ["wo-history", id],
    queryFn:  () => authFetchJSON("/api/v1/work-orders/" + id + "/history"),
    enabled:  !!id,
  });

  const { state, available, doTransition, loading: wfLoading } = useWorkflow(
    "work-orders", String(id), wo?.status || "draft", WO_TRANSITIONS,
    () => refetch()
  );

  if (isLoading) return <PageWrapper><LoadingState type="table" rows={6}/></PageWrapper>;
  if (isError || !wo) return <PageWrapper><AlertBanner type="error" title={error instanceof Error?error.message:"Work order not found"}/></PageWrapper>;

  const historyItems = Array.isArray(history) ? history : history?.history || [];

  const overview = (
    <div className="space-y-4">
      <WorkflowBar state={state} available={available} onTransition={doTransition} loading={wfLoading}/>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {[
          ["Priority",    <span className={"text-xs font-bold px-2.5 py-1 rounded-full "+getStateColor(wo.priority||"medium")}>{wo.priority}</span>],
          ["Type",        wo.type || "—"],
          ["Technician",  wo.technician_id || "Unassigned"],
          ["Asset",       wo.asset_id || "—"],
          ["Due Date",    wo.due_date ? fmtDate(wo.due_date) : "—"],
          ["Created",     fmtDate(wo.created_at)],
        ].map(([label, value]: any) => (
          <div key={String(label)} className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <div className="text-sm font-medium text-slate-900">{value}</div>
          </div>
        ))}
      </div>
      {wo.description && (
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-2">Description</p>
          <p className="text-sm text-slate-700 leading-relaxed">{wo.description}</p>
        </div>
      )}
    </div>
  );

  const timeline = (
    <div className="space-y-3">
      {historyItems.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">No history yet</p>
      ) : historyItems.map((h: any, i: number) => (
        <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"/>
          <div>
            <p className="text-xs font-semibold text-slate-800">{h.action||h.title||"Update"}</p>
            <p className="text-xs text-slate-500">{h.user||h.actor||""} · {fmtDate(h.created_at||h.timestamp)}</p>
            {h.notes && <p className="text-xs text-slate-600 mt-1">{h.notes}</p>}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader
        title={wo.title || "Work Order"}
        subtitle={"Type: " + (wo.type||"—") + " · Priority: " + (wo.priority||"—")}
        badge="WO"
        actions={
          <Link href="/work-orders" className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
            <ArrowLeft className="w-4 h-4"/> Back
          </Link>
        }/>
      <EntityTabs tabs={[
        { id:"overview",  label:"Overview",  icon:"📋", content: overview  },
        { id:"timeline",  label:"History",   icon:"🕐", content: timeline  },
      ]}/>
    </PageWrapper>
  );
}
