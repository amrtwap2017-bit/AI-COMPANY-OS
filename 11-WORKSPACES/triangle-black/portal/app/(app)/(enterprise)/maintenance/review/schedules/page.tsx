"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchPlans() {
  const r = await fetch(`${BACK}/api/v1/maintenance/pm-plans`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? [];
}

export default function SchedulesPage() {
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["schedule-plans"], queryFn: fetchPlans, refetchInterval: 120000,
  });

  const today = new Date().toISOString().slice(0, 10);
  const w1 = new Date(Date.now() + 7*86400000).toISOString().slice(0, 10);
  const w2 = new Date(Date.now() + 14*86400000).toISOString().slice(0, 10);
  const w3 = new Date(Date.now() + 21*86400000).toISOString().slice(0, 10);
  const w4 = new Date(Date.now() + 28*86400000).toISOString().slice(0, 10);

  const overdue   = plans.filter((p) => p.next_due_date && p.next_due_date < today);
  const thisWeek  = plans.filter((p) => p.next_due_date && p.next_due_date >= today && p.next_due_date <= w1);
  const week2     = plans.filter((p) => p.next_due_date && p.next_due_date > w1 && p.next_due_date <= w2);
  const week3     = plans.filter((p) => p.next_due_date && p.next_due_date > w2 && p.next_due_date <= w3);
  const week4     = plans.filter((p) => p.next_due_date && p.next_due_date > w3 && p.next_due_date <= w4);

  const thisMonth = plans.filter((p) => p.next_due_date && p.next_due_date >= today && p.next_due_date <= w4);

  const freqGroups = plans.reduce((acc, p) => {
    const f = p.frequency || "unknown";
    acc[f] = (acc[f] || 0) + 1;
    return acc;
  }, {});

  const sorted = [...plans].sort((a, b) => {
    if (!a.next_due_date) return 1;
    if (!b.next_due_date) return -1;
    return a.next_due_date.localeCompare(b.next_due_date);
  });

  if (isLoading) return <LoadingState message="Loading maintenance schedules..." />;

  return (
    <PageWrapper>
      <PageHeader
        title="Maintenance Schedule"
        subtitle="PM plan schedule — 4-week forward view"
        badge={overdue.length > 0 ? `${overdue.length} Overdue` : undefined}
      />

      <MetricStrip metrics={[
        { label: "Total Plans",    value: plans.length },
        { label: "Overdue",        value: overdue.length,  color: overdue.length > 0 ? "red" as const : "slate" as const },
        { label: "Due This Week",  value: thisWeek.length, color: "amber" as const },
        { label: "Due This Month", value: thisMonth.length },
      ]} />

      <SectionCard title="4-Week Schedule Overview">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "This Week",  items: thisWeek },
            { label: "Week 2",     items: week2 },
            { label: "Week 3",     items: week3 },
            { label: "Week 4",     items: week4 },
          ].map(({ label, items }) => (
            <div key={label} className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-600 mb-2">{label}</p>
              <p className="text-2xl font-bold text-slate-800">{items.length}</p>
              <div className="mt-2 space-y-1">
                {items.slice(0, 3).map((p) => (
                  <p key={p.id} className="text-xs text-slate-500 truncate">{p.title}</p>
                ))}
                {items.length > 3 && (
                  <p className="text-xs text-slate-400">+{items.length - 3} more</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {overdue.length > 0 && (
        <SectionCard title="Overdue Plans">
          <div className="space-y-2">
            {overdue.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 bg-red-50 rounded-lg border border-red-100">
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.title}</p>
                  <p className="text-xs text-slate-500">{p.frequency} · {p.next_due_date}</p>
                </div>
                <StatusBadge status={p.plan_type || "preventive"} />
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard title="By Frequency">
        <div className="flex flex-wrap gap-3">
          {Object.entries(freqGroups).map(([freq, count]) => (
            <div key={freq} className="px-4 py-2 bg-slate-100 rounded-lg text-center">
              <p className="text-lg font-bold text-slate-800">{count}</p>
              <p className="text-xs text-slate-500 capitalize">{freq}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageWrapper>
  );
}