// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { Calendar, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { useState } from "react";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const TYPE_COLORS: Record<string, string> = {
  preventive: "bg-blue-100 text-blue-700 border-blue-200",
  inspection: "bg-amber-100 text-amber-700 border-amber-200",
  corrective: "bg-red-100 text-red-700 border-red-200",
  predictive: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function MaintenanceSchedulePage() {
  const now = new Date();
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const { data, isLoading } = useQuery({
    queryKey: ["pm-schedule", viewYear, viewMonth],
    queryFn: () => authFetch("/api/v1/maintenance/pm-plans?limit=200").then(r => r.json()),
  });

  if (isLoading) return <PageWrapper><LoadingState title="Loading schedule..." /></PageWrapper>;

  const plans = Array.isArray(data) ? data : data?.data ?? data?.items ?? [];

  // Filter to plans due this month
  const startOfMonth = new Date(viewYear, viewMonth, 1);
  const endOfMonth   = new Date(viewYear, viewMonth + 1, 0);

  const thisMonth = plans.filter((p: any) => {
    if (!p.next_due_date) return false;
    const due = new Date(p.next_due_date);
    return due >= startOfMonth && due <= endOfMonth;
  });

  const overdue = plans.filter((p: any) => {
    if (!p.next_due_date || p.status !== "active") return false;
    return new Date(p.next_due_date) < now;
  });

  const upcoming7 = plans.filter((p: any) => {
    if (!p.next_due_date || p.status !== "active") return false;
    const due = new Date(p.next_due_date);
    const diff = (due.getTime() - now.getTime()) / 86400000;
    return diff >= 0 && diff <= 7;
  });

  // Build calendar grid
  const daysInMonth = endOfMonth.getDate();
  const firstDayOfWeek = startOfMonth.getDay();
  const calendarDays: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Plans indexed by day
  const byDay: Record<number, any[]> = {};
  thisMonth.forEach((p: any) => {
    const day = new Date(p.next_due_date).getDate();
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(p);
  });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Maintenance Schedule"
        subtitle="Monthly PM calendar — preventive + inspection plans"
        badge="Program B"
      />

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Overdue",         value: overdue.length,   icon: AlertTriangle, color: "text-red-600" },
          { label: "Due This Month",  value: thisMonth.length, icon: Calendar,      color: "text-blue-600" },
          { label: "Due in 7 Days",   value: upcoming7.length, icon: Clock,         color: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Month navigation */}
      <SectionCard title="Calendar">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
            ← Prev
          </button>
          <div className="text-base font-semibold text-slate-800">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </div>
          <button onClick={nextMonth} className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
            Next →
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="h-16" />;
            const dayPlans = byDay[day] ?? [];
            const isToday  = day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();
            return (
              <div
                key={day}
                className={`min-h-16 p-1 rounded-lg border text-xs
                  ${isToday ? "border-blue-400 bg-blue-50" : "border-slate-100 bg-slate-50"}
                  ${dayPlans.length > 0 ? "border-amber-200 bg-amber-50" : ""}`}
              >
                <div className={`font-semibold mb-1 ${isToday ? "text-blue-700" : "text-slate-600"}`}>
                  {day}
                </div>
                {dayPlans.slice(0, 2).map((p: any) => (
                  <div
                    key={p.id}
                    className={`px-1 py-0.5 rounded text-xs mb-0.5 truncate border
                      ${TYPE_COLORS[p.plan_type] ?? TYPE_COLORS.preventive}`}
                    title={p.title}
                  >
                    {p.title?.slice(0, 12)}
                  </div>
                ))}
                {dayPlans.length > 2 && (
                  <div className="text-xs text-slate-400">+{dayPlans.length - 2}</div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Overdue list */}
      {overdue.length > 0 && (
        <SectionCard title={`Overdue Plans (${overdue.length})`}>
          <div className="space-y-2">
            {overdue.slice(0, 10).map((p: any) => {
              const daysOverdue = Math.floor(
                (now.getTime() - new Date(p.next_due_date).getTime()) / 86400000
              );
              return (
                <div key={p.id}
                     className="flex items-center justify-between p-3
                                bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-slate-800">{p.title}</div>
                      <div className="text-xs text-slate-500">{p.plan_type} · {p.frequency}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-red-600">{daysOverdue}d overdue</div>
                    <div className="text-xs text-slate-400">{String(p.next_due_date).slice(0,10)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* This month's plans */}
      <SectionCard title={`Plans This Month (${thisMonth.length})`}>
        <div className="space-y-2">
          {thisMonth.map((p: any) => (
            <div key={p.id}
                 className="flex items-center justify-between p-3
                            bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-slate-800">{p.title}</div>
                  <div className="text-xs text-slate-400">{p.plan_type} · {p.frequency}</div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-slate-500">Due</div>
                <div className="text-sm font-medium text-slate-700">
                  {String(p.next_due_date).slice(0,10)}
                </div>
              </div>
            </div>
          ))}
          {thisMonth.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">
              No plans scheduled for {MONTH_NAMES[viewMonth]} {viewYear}
            </p>
          )}
        </div>
      </SectionCard>
    </PageWrapper>
  );
}
