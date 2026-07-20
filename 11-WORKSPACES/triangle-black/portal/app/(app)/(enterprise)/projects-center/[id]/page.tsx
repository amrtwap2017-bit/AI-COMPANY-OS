"use client";
// @ts-nocheck
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  PageHeader, PageWrapper, SectionCard, LoadingState,
  AlertBanner, StatusBadge, Progress,
} from "@/components/ui";
import { projectsApi } from "@/lib/api/enterprise";
import { fmtDate, fmtCurrency } from "@/lib/design-tokens";
import { ArrowLeft, Calendar, DollarSign, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: project, isLoading, isError, error } = useQuery({
    queryKey: ["project", id],
    queryFn:  () => projectsApi.get(id).then(r => r.data),
    staleTime: 30_000,
  });

  const { data: phases = [] } = useQuery({
    queryKey: ["project-phases", id],
    queryFn:  () => projectsApi.phases(id).then(r => Array.isArray(r.data) ? r.data : []),
    staleTime: 30_000,
    enabled: !!project,
  });

  const { data: risks = [] } = useQuery({
    queryKey: ["project-risks", id],
    queryFn:  () => projectsApi.risks(id).then(r => Array.isArray(r.data) ? r.data : []),
    staleTime: 30_000,
    enabled: !!project,
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ["project-milestones", id],
    queryFn:  () => projectsApi.milestones(id).then(r => Array.isArray(r.data) ? r.data : []),
    staleTime: 30_000,
    enabled: !!project,
  });

  if (isLoading) return <PageWrapper><LoadingState type="detail" /></PageWrapper>;
  if (isError || !project) return (
    <PageWrapper>
      <AlertBanner type="error" title={error instanceof Error ? error.message : "Project not found"} />
    </PageWrapper>
  );

  const p = project;
  const pct = p.completion_pct || 0;

  return (
    <PageWrapper>
      <PageHeader
        title={p.title || "Project"}
        subtitle={p.description || ""}
        badge="PROJ"
        back={
          <Link href="/projects-center"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-4 h-4" /> All Projects
          </Link>
        }
        actions={<StatusBadge status={p.status || "planning"} />}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Completion", value: pct + "%",                    color: pct >= 80 ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700" },
          { label: "Budget",     value: fmtCurrency(p.budget || 0),   color: "bg-blue-50 border-blue-200 text-blue-700" },
          { label: "Phases",     value: phases.length + " phases",     color: "bg-slate-50 border-slate-200 text-slate-700" },
          { label: "Open Risks", value: risks.filter((r:any) => r.status === "open").length + " risks",
            color: risks.filter((r:any) => r.status === "open").length > 0 ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700" },
        ].map(m => (
          <div key={m.label} className={"rounded-2xl border p-4 " + m.color}>
            <div className="text-2xl font-bold">{m.value}</div>
            <div className="text-xs font-medium mt-1 opacity-80">{m.label}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Project Progress">
        <div className="space-y-3">
          <Progress value={pct} max={100} size="lg" label={p.title} showValue
            color={pct >= 80 ? "emerald" : pct >= 50 ? "amber" : "blue"} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { icon: Calendar,   label: "Start Date",    value: fmtDate(p.start_date) },
              { icon: Calendar,   label: "End Date",      value: fmtDate(p.end_date) },
              { icon: DollarSign, label: "Budget",        value: fmtCurrency(p.budget || 0) },
              { icon: CheckCircle2,label: "Status",       value: p.status },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                <f.icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{f.label}</p>
                  <p className="text-sm font-medium text-slate-900 capitalize">{f.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {phases.length > 0 && (
        <SectionCard title="Project Phases" subtitle={phases.length + " phases"}>
          <div className="space-y-3">
            {phases.map((phase: any) => (
              <div key={phase.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900">{phase.name || phase.title}</p>
                  <p className="text-xs text-slate-400">
                    {fmtDate(phase.start_date)} to {fmtDate(phase.end_date)}
                  </p>
                </div>
                <StatusBadge status={phase.status || "planning"} />
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {milestones.length > 0 && (
        <SectionCard title="Milestones" subtitle={milestones.length + " milestones"}>
          <div className="space-y-2">
            {milestones.map((m: any) => (
              <div key={m.id} className={m.status === "completed" ? "flex items-center gap-3 p-3 rounded-xl border bg-emerald-50 border-emerald-200" : "flex items-center gap-3 p-3 rounded-xl border bg-white border-slate-200"}>
                {m.status === "completed"
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  : <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                }
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{m.name || m.title}</p>
                  {m.due_date && <p className="text-xs text-slate-400">Due: {fmtDate(m.due_date)}</p>}
                </div>
                <StatusBadge status={m.status || "pending"} />
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {risks.length > 0 && (
        <SectionCard title="Project Risks" subtitle={risks.filter((r:any) => r.status === "open").length + " open risks"}>
          <div className="space-y-2">
            {risks.map((risk: any) => (
              <div key={risk.id} className={"flex items-start gap-3 p-3 rounded-xl border " +
                (risk.status === "open" ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200")}>
                <AlertTriangle className={"w-4 h-4 flex-shrink-0 mt-0.5 " + (risk.status === "open" ? "text-red-500" : "text-slate-400")} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{risk.title || risk.description}</p>
                  <p className="text-xs text-slate-500 capitalize">Level: {risk.level || risk.severity || "medium"}</p>
                </div>
                <StatusBadge status={risk.status || "open"} />
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </PageWrapper>
  );
}
