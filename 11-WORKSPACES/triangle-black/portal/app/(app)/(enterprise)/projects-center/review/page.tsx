"use client"; // @ts-nocheck

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchProjects() {
  try {  
    const r = await fetch(`${BACK
  } catch { return []; }
}/api/v1/projects`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? [];
}
async function fetchWOs() {
  try {  
    const r = await fetch(`${BACK
  } catch { return []; }
}/api/v1/work-orders`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? [];
}

export default function ProjectsReviewPage() {
  const [filter, setFilter] = useState("all");

  const { data: projects = [], isLoading: p1 } = useQuery({
    queryKey: ["proj-review-projects"], queryFn: fetchProjects, refetchInterval: 300000,
  });
  const { data: wos = [], isLoading: p2 } = useQuery({
    queryKey: ["proj-review-wos"], queryFn: fetchWOs, refetchInterval: 300000,
  });

  const isLoading = p1 || p2;
  const today = new Date().toISOString().slice(0, 10);

  const getDays = (end) => {
    if (!end) return null;
    return Math.ceil((new Date(end) - new Date()) / 86400000);
  };

  const withDays = (projects || []).map((p: any) => ({
    ...p,
    daysLeft: getDays(p.end_date),
    woCount: (wos || []).filter((w: any) => w.contract_id === p.contract_id).length,
  }));

  const active    = withDays.filter((p: any) => p.status === "active");
  const atRisk    = active.filter((p: any) => p.daysLeft !== null && p.daysLeft <= 14);
  const completed = withDays.filter((p: any) => p.status === "completed");
  const onHold    = withDays.filter((p: any) => p.status === "on_hold");

  const filtered = filter === "all"      ? withDays
    : filter === "active"    ? active
    : filter === "completed" ? completed
    : filter === "on_hold"   ? onHold
    : withDays;

  const onTrackCount = active.filter((p: any) => p.daysLeft === null || p.daysLeft > 14).length;
  const healthPct    = active.length > 0 ? Math.round((onTrackCount / active.length) * 100) : 100;

  const TABS = ["all", "active", "completed", "on_hold"];

  if (isLoading) return <LoadingState message="Loading project review..." />;

  return (
    <PageWrapper>
      <PageHeader
        title="Projects Review"
        subtitle="Performance and milestone overview"
        badge={atRisk.length > 0 ? `${atRisk.length} At Risk` : undefined}
      />

      <MetricStrip metrics={Array.isArray([
        { label: "Total",     value: (projects || []).length ) ? [
        { label: "Total",     value: (projects || []).length  : []},
        { label: "Active",    value: active.length,    color: "green" as const },
        { label: "At Risk",   value: atRisk.length,    color: atRisk.length > 0 ? "red" as const : "slate" as const },
        { label: "Completed", value: completed.length, color: "blue" as const },
      ]} />

      <SectionCard title={`Schedule Health: ${healthPct}% On Track`}>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden mb-2">
          <div
            className={`h-3 rounded-full ${healthPct >= 80 ? "bg-green-500" : healthPct >= 60 ? "bg-amber-400" : "bg-red-500"}`}
            style={{ width: `${healthPct}%` }}
          />
        </div>
        <p className="text-xs text-slate-500">
          {onTrackCount} of {active.length} active projects on track ({active.length - onTrackCount} at risk)
        </p>
      </SectionCard>

      <SectionCard title="Project List">
        <div className="flex gap-2 mb-4 flex-wrap">
          {TABS.map((t: any) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === t ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.replace("_", " ")}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No projects" description="No projects match this filter" />
        ) : (
          <div className="space-y-3">
            {filtered.map((p: any) => {
              const isAtRisk  = p.daysLeft !== null && p.daysLeft <= 14 && p.status === "active";
              const isSoon    = p.daysLeft !== null && p.daysLeft > 14 && p.daysLeft <= 30 && p.status === "active";
              return (
                <div
                  key={p.id}
                  className={`px-4 py-4 rounded-lg border ${
                    isAtRisk ? "border-red-200 bg-red-50" :
                    isSoon   ? "border-amber-200 bg-amber-50" :
                    "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-slate-800">{p.name}</p>
                        {isAtRisk && (
                          <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                            AT RISK
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {p.start_date?.slice(0, 10)} to {p.end_date?.slice(0, 10)}
                        {p.daysLeft !== null && (
                          <span className={`ml-2 font-medium ${
                            isAtRisk ? "text-red-600" : isSoon ? "text-amber-600" : "text-slate-400"
                          }`}>
                            {p.daysLeft > 0 ? `${p.daysLeft}d left` : `${Math.abs(p.daysLeft)}d overdue`}
                          </span>
                        )}
                      </p>
                      {p.woCount > 0 && (
                        <p className="text-xs text-slate-400 mt-0.5">{p.woCount} work orders</p>
                      )}
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
