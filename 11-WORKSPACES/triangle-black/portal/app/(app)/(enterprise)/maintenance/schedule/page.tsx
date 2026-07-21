"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState, StatusBadge, Progress } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { RefreshCw, Calendar, Clock } from "lucide-react";
import { toast } from "@/lib/toast";
import { fmtDate } from "@/lib/design-tokens";

const FREQ_ORDER = { daily:1, weekly:2, monthly:3, quarterly:4, "semi-annual":5, annually:6 };

export default function MaintenanceSchedulePage() {
  const { data = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["maint-schedule"],
    queryFn: async () => {
      const res = await authFetch("/api/v1/maintenance/pm-plans");
      if (!res.ok) return [];
      const d = await res.json();
      return Array.isArray(d) ? d : d?.items || [];
    },
    staleTime: 30_000,
  });

  const now = new Date();
  const overdue = data.filter(p => p.next_due_date && new Date(p.next_due_date) < now && p.status === "active");
  const thisWeek = data.filter(p => {
    if (!p.next_due_date) return false;
    const d = new Date(p.next_due_date);
    const nw = new Date(now.getTime() + 7*24*60*60*1000);
    return d >= now && d <= nw;
  });
  const thisMonth = data.filter(p => {
    if (!p.next_due_date) return false;
    const d = new Date(p.next_due_date);
    const nm = new Date(now.getTime() + 30*24*60*60*1000);
    return d >= now && d <= nm;
  });

  const byFreq = data.reduce((acc, p) => {
    const f = p.frequency || "other";
    acc[f] = (acc[f] || 0) + 1;
    return acc;
  }, {});

  const PlanRow = ({ plan }) => (
    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-amber-300 transition-all">
      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-900 truncate">{plan.title}</p>
        <p className="text-xs text-slate-400 capitalize">{plan.plan_type} · {plan.frequency} · {plan.owner || "Unassigned"}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-slate-500">{fmtDate(plan.next_due_date)}</span>
        <StatusBadge status={plan.status || "active"} />
      </div>
    </div>
  );

  return (
    <PageWrapper>
      <PageHeader title="Maintenance Schedule" subtitle="PM plan calendar and scheduling overview" badge="SCHED"
        actions={
          <button onClick={() => { refetch(); toast.success("Refreshed"); }} disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        } />

      {isLoading ? <LoadingState type="cards" rows={4} cols={4} /> : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Plans",   value: data.length,      color: "bg-slate-50 border-slate-200 text-slate-900" },
              { label: "Overdue",       value: overdue.length,   color: overdue.length > 0 ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700" },
              { label: "Due This Week", value: thisWeek.length,  color: "bg-amber-50 border-amber-200 text-amber-700" },
              { label: "Due This Month",value: thisMonth.length, color: "bg-blue-50 border-blue-200 text-blue-700" },
            ].map(m => (
              <div key={m.label} className={"rounded-2xl border p-4 " + m.color}>
                <div className="text-2xl font-bold">{m.value}</div>
                <div className="text-xs font-medium mt-1 opacity-80">{m.label}</div>
              </div>
            ))}
          </div>

          <SectionCard title="By Frequency">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(byFreq).sort((a,b) => (FREQ_ORDER[a[0]]||9) - (FREQ_ORDER[b[0]]||9)).map(([freq, count]) => (
                <div key={freq} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xl font-bold text-slate-900">{count}</div>
                  <div className="text-xs text-slate-500 capitalize mt-0.5">{freq}</div>
                  <div className="mt-2"><Progress value={count} max={data.length} size="sm" color="amber" /></div>
                </div>
              ))}
            </div>
          </SectionCard>

          {overdue.length > 0 && (
            <SectionCard title={"Overdue Plans (" + overdue.length + ")"} subtitle="Past due date - action required">
              <div className="space-y-2">
                {overdue.map(p => <PlanRow key={p.id} plan={p} />)}
              </div>
            </SectionCard>
          )}

          <SectionCard title={"Due This Week (" + thisWeek.length + ")"} subtitle="Next 7 days">
            {thisWeek.length === 0
              ? <EmptyState icon="✅" title="Nothing due this week" description="All maintenance is on schedule" />
              : <div className="space-y-2">{thisWeek.map(p => <PlanRow key={p.id} plan={p} />)}</div>
            }
          </SectionCard>
        </>
      )}
    </PageWrapper>
  );
}
