"use client"; // @ts-nocheck

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchPlans() {
  try {  
    const r = await fetch(`${BACK}/api/v1/maintenance/pm-plans`, { credentials: "include" });`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? d.data ?? [];
}

function daysDiff(dateStr) {
  if (!dateStr) return null;
  const today = new Date().toISOString().slice(0, 10);
  const diff = Math.ceil((new Date(dateStr) - new Date(today)) / 86400000);
  return diff;
}

export default function PMPlansPage() {
  const [filter, setFilter] = useState("all");

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["pm-plans"],
    queryFn: fetchPlans,
    refetchInterval: 120000,
  });

  const today = new Date().toISOString().slice(0, 10);

  const overdue   = plans.filter((p: any) => p.next_due_date && p.next_due_date < today);
  const dueSoon   = plans.filter((p: any) => p.next_due_date && p.next_due_date >= today && p.next_due_date <= new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const active    = plans.filter((p: any) => p.status === "active");
  const byType    = filter === "all" ? plans : plans.filter((p: any) => p.plan_type === filter);
  const sorted    = [...byType].sort((a: any, b: any) => {
    const aOver = a.next_due_date && a.next_due_date < today;
    const bOver = b.next_due_date && b.next_due_date < today;
    if (aOver && !bOver) return -1;
    if (!aOver && bOver) return 1;
    return (a.next_due_date || "").localeCompare(b.next_due_date || "");
  });

  const TYPES = ["all", "preventive", "inspection", "corrective"];

  if (isLoading) return <LoadingState message="Loading PM plans..." />;

  return (
    <PageWrapper>
      <PageHeader
        title="PM Plans"
        subtitle="Preventive maintenance schedule — 30 active plans"
        badge={overdue.length > 0 ? `${overdue.length} Overdue` : undefined}
      />

      <MetricStrip metrics={[
        { label: "Total Plans",  value: plans.length },
        { label: "Active",       value: active.length,   color: "green" as const },
        { label: "Overdue",      value: overdue.length,  color: overdue.length > 0 ? "red" as const : "slate" as const },
        { label: "Due This Week",value: dueSoon.length,  color: "amber" as const },
      ]} />

      {overdue.length > 0 && (
        <SectionCard title="Overdue Plans">
          <div className="space-y-2">
            {overdue.slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{p.title}</p>
                  <p className="text-xs text-slate-500">{p.frequency} · {p.owner || "Unassigned"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-red-600">
                    {Math.abs(daysDiff(p.next_due_date) || 0)}d overdue
                  </span>
                  <StatusBadge status={p.plan_type || "preventive"} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard title="All Plans">
        <div className="flex gap-2 mb-4 flex-wrap">
          {TYPES.map((t: any) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === t ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t === "all" ? `All (${plans.length})` : `${t} (${plans.filter((p: any) => p.plan_type === t).length})`}
            </button>
          ))}
        </div>

        {sorted.length === 0 ? (
          <EmptyState title="No plans" description="No PM plans match this filter" />
        ) : (
          <div className="space-y-2">
            {sorted.map((p: any) => {
              const diff = daysDiff(p.next_due_date);
              const isOver = diff !== null && diff < 0;
              const isSoon = diff !== null && diff >= 0 && diff <= 7;
              return (
                <div key={p.id} className={`flex items-center justify-between px-4 py-3 rounded-lg ${
                  isOver ? "bg-red-50 border border-red-100" :
                  isSoon ? "bg-amber-50 border border-amber-100" :
                  "bg-slate-50"
                }`}>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{p.title}</p>
                    <p className="text-xs text-slate-500">{p.frequency} · {p.owner || "Unassigned"}</p>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <p className={`text-xs font-medium ${isOver ? "text-red-600" : isSoon ? "text-amber-600" : "text-slate-500"}`}>
                        {p.next_due_date || "No date"}
                      </p>
                      {diff !== null && (
                        <p className="text-xs text-slate-400">
                          {isOver ? `${Math.abs(diff)}d overdue` : `in ${diff}d`}
                        </p>
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
