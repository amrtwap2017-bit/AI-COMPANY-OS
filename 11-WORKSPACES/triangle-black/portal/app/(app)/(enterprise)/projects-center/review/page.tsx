// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";


// Safe date formatter
const fmtDate = (d: any): string => {
  if (!d) return "—";
  try { return fmtDate(d); }
  catch { return String(d).slice(0, 10); }
};

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchProjects() {
  try {
    const r = await authFetch(`/api/v1/projects/`).then(r => r.json());
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : (d?.items ?? []);
  } catch { return []; }
}
async function fetchWOs() {
  try {
    const r = await authFetch(`/api/v1/work-orders/`).then(r => r.json());
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : (d?.items ?? []);
  } catch { return []; }
}

export default function ProjectsReviewPage() {
  const [filter, setFilter] = useState("all");
  const { data: projects = [], isLoading: p1 } = useQuery({ queryKey: ["proj-review"], queryFn: fetchProjects, refetchInterval: 300000 });
  const { data: wos = [], isLoading: p2 } = useQuery({ queryKey: ["proj-review-wos"], queryFn: fetchWOs, refetchInterval: 300000 });

  const isLoading = p1 || p2;
  const today = new Date().toISOString().slice(0, 10);

  const getDays = (end) => end ? Math.ceil((new Date(end) - new Date()) / 86400000) : null;

  const withDays = toArr(projects).map((p) => ({
    ...p,
    daysLeft: getDays(p.end_date),
    woCount: toArr(wos).filter((w) => w.contract_id === p.contract_id).length,
  }));

  const active    = toArr(withDays).filter((p) => p.status === "active");
  const atRisk    = active.filter((p) => p.daysLeft !== null && p.daysLeft <= 14);
  const completed = toArr(withDays).filter((p) => p.status === "completed");

  const filtered = filter === "all" ? withDays
    : filter === "active" ? active
    : filter === "completed" ? completed
    : toArr(withDays).filter((p) => p.status === filter);

  if (isLoading) return <LoadingState message="Loading project review..." />;

  return (
    <PageWrapper>
      <PageHeader title="Projects Review" subtitle="Performance and milestone overview" badge={atRisk.length > 0 ? `${atRisk.length} At Risk` : undefined} />
      <MetricStrip metrics={[
        { label: "Total",     value: withDays.length },
        { label: "Active",    value: active.length,    color: "green" as const },
        { label: "At Risk",   value: atRisk.length,    color: atRisk.length > 0 ? "red" as const : "slate" as const },
        { label: "Completed", value: completed.length, color: "blue" as const },
      ]} />
      <SectionCard title="Projects">
        <div className="flex gap-2 mb-4 flex-wrap">
          {["all","active","completed","on_hold"].map((t) => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${filter===t ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {t.replace("_"," ")}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? <EmptyState title="No projects" description="No projects match this filter" /> : (
          <div className="space-y-3">
            {filtered.map((p) => {
              const isAtRisk = p.daysLeft !== null && p.daysLeft <= 14 && p.status === "active";
              return (
                <div key={p.id} className={`px-4 py-4 rounded-lg border ${isAtRisk ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-slate-800">{p.name}</p>
                        {isAtRisk && <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded">AT RISK</span>}
                      </div>
                      <p className="text-xs text-slate-500">
                        {p.start_date?.slice(0,10)} → {p.end_date?.slice(0,10)}
                        {p.daysLeft !== null && <span className={`ml-2 font-medium ${isAtRisk ? "text-red-600" : "text-slate-400"}`}>{p.daysLeft > 0 ? `${p.daysLeft}d left` : `${Math.abs(p.daysLeft)}d overdue`}</span>}
                      </p>
                    </div>
                    <StatusBadge status={p.status || "active"} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </PageWrapper>
  );
}
