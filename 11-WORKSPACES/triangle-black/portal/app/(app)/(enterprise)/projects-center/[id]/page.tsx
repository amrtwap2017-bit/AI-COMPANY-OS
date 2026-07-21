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
import { fmtDate } from "@/lib/design-tokens";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["project", id],
    queryFn:  () => authFetchJSON("/api/v1/projects/" + id),
    enabled:  !!id,
  });
  const { data: phases  = [] } = useQuery({ queryKey:["project-phases",id],  queryFn:()=>authFetchJSON("/api/v1/projects/"+id+"/phases"),     enabled:!!id });
  const { data: risks   = [] } = useQuery({ queryKey:["project-risks",id],   queryFn:()=>authFetchJSON("/api/v1/projects/"+id+"/risks"),      enabled:!!id });
  const { data: milestones=[] } = useQuery({ queryKey:["project-miles",id],  queryFn:()=>authFetchJSON("/api/v1/projects/"+id+"/milestones"),  enabled:!!id });

  if (isLoading) return <PageWrapper><LoadingState type="table" rows={6}/></PageWrapper>;
  if (isError || !data) return <PageWrapper><AlertBanner type="error" title="Project not found"/></PageWrapper>;
  const p: any  = Array.isArray(data) ? data[0] : data;
  const pList   = Array.isArray(phases)     ? phases     : phases?.phases     || [];
  const rList   = Array.isArray(risks)      ? risks      : risks?.risks       || [];
  const mList   = Array.isArray(milestones) ? milestones : milestones?.milestones || [];

  const progress = Number(p?.progress || p?.completion_percentage || 0);

  const overview = (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">Progress</span>
          <span className="text-sm font-bold text-amber-600">{progress}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full">
          <div className="h-2 bg-amber-500 rounded-full transition-all" style={{width: progress+"%"}}/>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Status",     <span className={"text-xs font-bold px-2 py-0.5 rounded-full "+getStateColor(p?.status||"active")}>{p?.status}</span>],
          ["Client",     p?.client || p?.hotel_id || "—"],
          ["Start Date", p?.start_date ? fmtDate(p.start_date) : "—"],
          ["End Date",   p?.end_date   ? fmtDate(p.end_date)   : "—"],
          ["Budget",     p?.budget_total ? "EGP "+Number(p.budget_total).toLocaleString() : "—"],
          ["Spent",      p?.budget_spent ? "EGP "+Number(p.budget_spent).toLocaleString() : "—"],
        ].map(([label, value]: any) => (
          <div key={label} className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <div className="text-sm font-medium text-slate-900">{value}</div>
          </div>
        ))}
      </div>
      {p?.description && <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-500 mb-1">Description</p><p className="text-sm text-slate-700">{p.description}</p></div>}
    </div>
  );

  const phaseCols = [
    { key:"name",       label:"Phase",    render:(r:any)=><span className="text-sm font-semibold">{r.name}</span> },
    { key:"status",     label:"Status",   render:(r:any)=><span className={"text-xs font-bold px-2 py-0.5 rounded-full "+getStateColor(r.status)}>{r.status}</span> },
    { key:"start_date", label:"Start",    render:(r:any)=><span className="text-xs text-slate-500">{r.start_date?fmtDate(r.start_date):"—"}</span> },
    { key:"end_date",   label:"End",      render:(r:any)=><span className="text-xs text-slate-500">{r.end_date?fmtDate(r.end_date):"—"}</span> },
  ];
  const riskCols = [
    { key:"title",      label:"Risk",     render:(r:any)=><span className="text-sm font-semibold">{r.title||r.description}</span> },
    { key:"severity",   label:"Severity", render:(r:any)=><span className={"text-xs font-bold px-2 py-0.5 rounded-full "+getStateColor(r.severity||"medium")}>{r.severity}</span> },
    { key:"mitigation", label:"Mitigation",render:(r:any)=><span className="text-xs text-slate-500">{r.mitigation||"—"}</span> },
  ];

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title={p?.name||"Project"} subtitle={"Progress: "+progress+"%"} badge="PRJ"
        actions={<Link href="/projects-center" className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-4 h-4"/> Back</Link>}/>
      <EntityTabs tabs={[
        { id:"overview",   label:"Overview",   icon:"📋", content: overview },
        { id:"phases",     label:"Phases",     icon:"🔄", badge: pList.length,
          content: pList.length===0?<p className="text-sm text-slate-400 text-center py-8">No phases</p>:<DataTable columns={phaseCols} data={pList}/> },
        { id:"risks",      label:"Risks",      icon:"⚠️",  badge: rList.length,
          content: rList.length===0?<p className="text-sm text-slate-400 text-center py-8">No risks</p>:<DataTable columns={riskCols} data={rList}/> },
      ]}/>
    </PageWrapper>
  );
}
