"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState, StatusBadge } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { RefreshCw, Calendar } from "lucide-react";
import { toast } from "@/lib/toast";
import { fmtDate } from "@/lib/design-tokens";

export default function OperationsCalendarPage() {
  const { data = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["ops-calendar"],
    queryFn: async () => {
      const res = await authFetch("/api/v1/maintenance/pm-plans");
      if (!res.ok) return [];
      const d = await res.json();
      return Array.isArray(d) ? d : d?.items || [];
    },
    staleTime: 30_000,
  });

  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const dueSoon = data.filter((p) => {
    if (!p.next_due_date) return false;
    const due = new Date(p.next_due_date);
    return due >= today && due <= nextWeek;
  });

  const overdue = data.filter((p) => {
    if (!p.next_due_date) return false;
    return new Date(p.next_due_date) < today && p.status === "active";
  });

  const typeColor = (t) => {
    if (t === "preventive") return "bg-blue-50 border-blue-200";
    if (t === "inspection") return "bg-amber-50 border-amber-200";
    return "bg-slate-50 border-slate-200";
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Operations Calendar"
        subtitle="Upcoming maintenance schedules and PM plans"
        badge="CAL"
        actions={
          <button onClick={() => { refetch(); toast.success("Refreshed"); }} disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        }
      />

      {isLoading ? <LoadingState type="list" rows={6} /> : (
        <div className="space-y-5">
          {overdue.length > 0 && (
            <SectionCard title={"Overdue (" + overdue.length + ")"} subtitle="Past due date, requires immediate attention">
              <div className="space-y-2">
                {overdue.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <Calendar className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-900">{p.title}</p>
                      <p className="text-xs text-slate-500 capitalize">{p.plan_type} · {p.frequency}</p>
                    </div>
                    <div className="text-xs text-red-600 font-semibold">{fmtDate(p.next_due_date)}</div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          <SectionCard title={"Due This Week (" + dueSoon.length + ")"} subtitle="Maintenance plans due in the next 7 days">
            {dueSoon.length === 0 ? (
              <EmptyState icon="✅" title="No plans due this week" description="All maintenance is on schedule" />
            ) : (
              <div className="space-y-2">
                {dueSoon.map((p) => (
                  <div key={p.id} className={"flex items-center gap-3 p-3 rounded-xl border " + typeColor(p.plan_type)}>
                    <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-900">{p.title}</p>
                      <p className="text-xs text-slate-500 capitalize">{p.plan_type} · {p.frequency}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{fmtDate(p.next_due_date)}</span>
                      <StatusBadge status={p.status || "active"} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title={"All Plans (" + data.length + ")"} subtitle="Complete PM plan schedule">
            {data.length === 0 ? (
              <EmptyState icon="📅" title="No PM plans" description="Add preventive maintenance plans to see them here" />
            ) : (
              <div className="space-y-2">
                {data.slice(0, 10).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900">{p.title}</p>
                      <p className="text-xs text-slate-400 capitalize">{p.plan_type} · {p.frequency}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{fmtDate(p.next_due_date)}</span>
                      <StatusBadge status={p.status || "active"} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </PageWrapper>
  );
}
