"use client"; // @ts-nocheck
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";;
import { useParams } from "next/navigation";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useState } from "react";
import { ChevronRight, Loader2, TrendingUp, DollarSign, Clock, CheckCircle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  planning:  "bg-blue-100 text-blue-700",
  active:    "bg-emerald-100 text-emerald-700",
  on_hold:   "bg-amber-100 text-amber-700",
  completed: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-100 text-red-700",
  closed:    "bg-slate-200 text-slate-500",
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [transResult, setTransResult] = useState<any>(null);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => authFetch(`/api/v1/projects/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: transData = {} } = useQuery({
    queryKey: ["project-transitions", id],
    queryFn: () => authFetch(`/api/v1/projects/${id}/transitions`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: financials = {} } = useQuery({
    queryKey: ["project-ev", id],
    queryFn: () => authFetch(`/api/v1/projects/${id}/financials`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: wos = {} } = useQuery({
    queryKey: ["project-wos", id],
    queryFn: () => authFetch(`/api/v1/work-orders/?project_id=${id}&limit=20`).then(r => r.json()),
    enabled: !!id,
  });

  const transition = useMutation({
    mutationFn: (to: string) => authFetch(`/api/v1/projects/${id}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, comment: "Portal transition" }),
    }).then(r => r.json()),
    onSuccess: (data) => {
      setTransResult(data);
      qc.invalidateQueries({ queryKey: ["project", id] });
      qc.invalidateQueries({ queryKey: ["project-transitions", id] });
    },
  });

  if (isLoading) return <PageWrapper><LoadingState title="Loading project..." /></PageWrapper>;
  if (!project || project.detail) return <PageWrapper><p className="p-8 text-slate-400">Project not found</p></PageWrapper>;

  const allowed: string[] = transData?.allowed_transitions ?? [];
  const woList = Array.isArray(wos) ? wos : wos?.data ?? wos?.items ?? [];
  const ev     = financials?.earned_value ?? {};
  const fstatus = financials?.status ?? {};

  return (
    <PageWrapper>
      <PageHeader
        title={project.name || project.title || "Project"}
        subtitle={project.description ?? ""}
        badge={
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[project.status] ?? ""}`}>
            {project.status}
          </span>
        }
      />

      {transResult && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
          ✅ {transResult.message}
        </div>
      )}

      {/* Earned Value strip */}
      {ev.bac > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Budget (BAC)",     value: `${Number(ev.bac||0).toLocaleString()} EGP`,   icon: DollarSign,  color: "text-slate-700" },
            { label: "Progress",         value: `${ev.progress_pct ?? 0}%`,                    icon: TrendingUp,  color: "text-blue-600" },
            { label: "CPI",              value: ev.cpi ?? 0,                                   icon: CheckCircle, color: (ev.cpi ?? 1) >= 0.95 ? "text-emerald-600" : "text-red-600" },
            { label: "Cost Status",      value: fstatus.cost ?? "—",                           icon: Clock,       color: fstatus.cost === "on_budget" ? "text-emerald-600" : "text-amber-600" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
              <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
              <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <SectionCard title="Project Details">
            <div className="space-y-2 text-sm">
              {[
                ["Status",    project.status],
                ["Start",     String(project.start_date ?? project.created_at ?? "").slice(0,10)],
                ["End",       String(project.end_date ?? "—").slice(0,10)],
                ["Budget",    project.budget ? `${Number(project.budget).toLocaleString()} EGP` : "—"],
                ["Progress",  project.progress_percentage ? `${project.progress_percentage}%` : "—"],
              ].filter(([, v]) => v && v !== "—").map(([k, v]) => (
                <div key={k as string} className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-800 font-medium">{v}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Phase transitions */}
          {allowed.length > 0 && (
            <SectionCard title="Phase Transition">
              <p className="text-xs text-slate-500 mb-3">
                Current: <strong>{project.status}</strong>
              </p>
              <div className="space-y-2">
                {allowed.map((next: string) => (
                  <button
                    key={next}
                    onClick={() => transition.mutate(next)}
                    disabled={transition.isPending}
                    className="w-full h-9 flex items-center justify-between px-3
                               border border-slate-200 rounded-lg text-sm
                               hover:bg-slate-50 disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                      {next.replace(/_/g, " ")}
                    </span>
                    {transition.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                  </button>
                ))}
              </div>
            </SectionCard>
          )}
          {allowed.length === 0 && project.status && (
            <SectionCard title="Phase Status">
              <p className="text-sm text-slate-500 text-center py-4">
                Terminal state — no further transitions
              </p>
            </SectionCard>
          )}
        </div>

        {/* Work Orders */}
        <div className="lg:col-span-2">
          <SectionCard title={`Work Orders (${woList.length})`}>
            {woList.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {woList.map((wo: any) => (
                  <div key={wo.id} className="flex items-center justify-between p-3
                                               bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <div className="text-sm font-medium text-slate-800">{wo.title}</div>
                      <div className="text-xs text-slate-400">{wo.type} · {wo.priority}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0
                      ${wo.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                        wo.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                        "bg-slate-100 text-slate-600"}`}>
                      {wo.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">No work orders on this project</p>
            )}
          </SectionCard>

          {/* Earned Value detail */}
          {ev.bac > 0 && (
            <SectionCard title="Earned Value Analysis" className="mt-6">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["BAC (Budget)",      `${Number(ev.bac||0).toLocaleString()} EGP`],
                  ["EV (Earned)",       `${Number(ev.ev||0).toLocaleString()} EGP`],
                  ["AC (Actual Cost)",  `${Number(ev.ac||0).toLocaleString()} EGP`],
                  ["EAC (Forecast)",    `${Number(ev.eac||0).toLocaleString()} EGP`],
                  ["CPI",               ev.cpi ?? "—"],
                  ["SPI",               ev.spi ?? "—"],
                ].map(([k, v]) => (
                  <div key={k as string} className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">{k}</div>
                    <div className="text-sm font-semibold text-slate-800 mt-1">{v}</div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
