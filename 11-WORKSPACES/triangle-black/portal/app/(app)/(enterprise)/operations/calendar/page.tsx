"use client"; // @ts-nocheck

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
} from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchPMPlans() {
  try {  
    const res = await fetch(`${BACK
  } catch { return []; }
}/api/v1/maintenance/pm-plans`, { credentials: "include" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : data.items ?? data.data ?? [];
}

async function fetchWorkOrders() {
  try {  
    const res = await fetch(`${BACK
  } catch { return []; }
}/api/v1/work-orders`, { credentials: "include" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : data.items ?? data.work_orders ?? [];
}

function getWeekDays(startOffset: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = startOffset; i < startOffset + 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function OperationsCalendarPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const { data: pmPlans = [], isLoading: pmLoading } = useQuery({
    queryKey: ["pm-plans-calendar"],
    queryFn: fetchPMPlans,
  });

  const { data: workOrders = [], isLoading: woLoading } = useQuery({
    queryKey: ["work-orders-calendar"],
    queryFn: fetchWorkOrders,
  });

  const isLoading = pmLoading || woLoading;

  const weeks = [
    getWeekDays(0),
    getWeekDays(7),
    getWeekDays(14),
  ];

  function getItemsForDay(day: Date) {
    const pms = (pmPlans || []).filter((p: any) => {
      if (!p.next_due_date) return false;
      try { return isSameDay(new Date(p.next_due_date), day); }
      catch { return false; }
    });
    const wos = (workOrders || []).filter((w: any) => {
      if (!w.due_date) return false;
      try { return isSameDay(new Date(w.due_date), day); }
      catch { return false; }
    });
    return { pms, wos };
  }

  const thisWeek = weeks[0];
  const startOfWeek = thisWeek[0];
  const endOfWeek = thisWeek[6];
  const endOf3Weeks = weeks[2][6];

  const wosThisWeek = (workOrders || []).filter((w: any) => {
    if (!w.due_date) return false;
    try {
      const d = new Date(w.due_date);
      return d >= startOfWeek && d <= endOfWeek;
    } catch { return false; }
  }).length;

  const pmsThisWeek = (pmPlans || []).filter((p: any) => {
    if (!p.next_due_date) return false;
    try {
      const d = new Date(p.next_due_date);
      return d >= startOfWeek && d <= endOfWeek;
    } catch { return false; }
  }).length;

  const overdue = [
    ...(pmPlans || []).filter((p: any) => {
      if (!p.next_due_date) return false;
      try { return new Date(p.next_due_date) < today; }
      catch { return false; }
    }),
    ...(workOrders || []).filter((w: any) => {
      if (!w.due_date) return false;
      try { return new Date(w.due_date) < today && w.status !== "completed"; }
      catch { return false; }
    }),
  ].length;

  const total14 = [
    ...(pmPlans || []).filter((p: any) => {
      if (!p.next_due_date) return false;
      try {
        const d = new Date(p.next_due_date);
        return d >= today && d <= endOf3Weeks;
      } catch { return false; }
    }),
    ...(workOrders || []).filter((w: any) => {
      if (!w.due_date) return false;
      try {
        const d = new Date(w.due_date);
        return d >= today && d <= endOf3Weeks;
      } catch { return false; }
    }),
  ].length;

  const selectedItems = getItemsForDay(selectedDate);

  return (
    <PageWrapper>
      <PageHeader
        title="Operations Calendar"
        subtitle="PM plans and work orders scheduled view — 3 weeks"
        badge="Live"
      />

      <MetricStrip metrics={([
          { label: "WOs Due This Week", value: wosThisWeek, color: "amber" ) || []},
          { label: "PM Plans This Week", value: pmsThisWeek, color: "blue" },
          { label: "Overdue Items", value: overdue, color: "red" },
          { label: "Next 21 Days Total", value: total14, color: "slate" },
        ]}
      />

      {isLoading ? (
        <LoadingState message="Loading calendar data..." />
      ) : (
        <>
          {(weeks || []).map((week, wi) => (
            <SectionCard
              key={wi}
              title={
                wi === 0 ? "This Week" :
                wi === 1 ? "Next Week" :
                "Week After Next"
              }
            >
              <div className="grid grid-cols-7 gap-1">
                {(week || []).map((day, di) => {
                  const { pms, wos } = getItemsForDay(day);
                  const isToday = isSameDay(day, today);
                  const isSelected = isSameDay(day, selectedDate);
                  const isPast = day < today;
                  const hasItems = (pms || []).length > 0 || (wos || []).length > 0;

                  return (
                    <button
                      key={di}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        min-h-[80px] rounded-lg p-2 text-left border transition-all
                        ${isSelected
                          ? "border-slate-900 bg-slate-900 text-white"
                          : isToday
                          ? "border-blue-400 bg-blue-50"
                          : isPast
                          ? "border-slate-100 bg-slate-50 opacity-60"
                          : "border-slate-200 bg-white hover:border-slate-400"}
                      `}
                    >
                      <div className={`text-xs font-medium mb-1 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                        {DAY_NAMES[day.getDay()]}
                      </div>
                      <div className={`text-sm font-bold mb-1.5 ${
                        isSelected ? "text-white" :
                        isToday ? "text-blue-700" :
                        "text-slate-800"
                      }`}>
                        {day.getDate()} {MONTH_NAMES[day.getMonth()]}
                      </div>
                      <div className="space-y-0.5">
                        {(pms || []).slice(0, 2).map((p: any, i: number) => (
                          <div key={i} className={`text-[10px] px-1 py-0.5 rounded truncate ${
                            isSelected ? "bg-blue-400 text-white" : "bg-blue-100 text-blue-700"
                          }`}>
                            {p.title?.slice(0, 16) || "PM Plan"}
                          </div>
                        ))}
                        {(wos || []).slice(0, 2).map((w: any, i: number) => (
                          <div key={i} className={`text-[10px] px-1 py-0.5 rounded truncate ${
                            isSelected ? "bg-amber-400 text-white" : "bg-amber-100 text-amber-700"
                          }`}>
                            {w.title?.slice(0, 16) || "Work Order"}
                          </div>
                        ))}
                        {((pms || []).length + (wos || []).length) > 4 && (
                          <div className={`text-[10px] ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                            +{(pms || []).length + (wos || []).length - 4} more
                          </div>
                        )}
                        {!hasItems && (
                          <div className={`text-[10px] ${isSelected ? "text-slate-400" : "text-slate-300"}`}>
                            —
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          ))}

          <SectionCard
            title={`${DAY_NAMES[selectedDate.getDay()]} ${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]} — Items Due`}
          >
            {(selectedItems.pms || []).length === 0 && (selectedItems.wos || []).length === 0 ? (
              <EmptyState
                title="Nothing scheduled"
                description="No PM plans or work orders due on this day"
              />
            ) : (
              <div className="space-y-2">
                {(selectedItems.pms || []).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{p.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{p.frequency} · {p.owner || "Unassigned"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={p.plan_type || "preventive"} />
                      <StatusBadge status={p.status || "active"} />
                    </div>
                  </div>
                ))}
                {(selectedItems.wos || []).map((w: any) => (
                  <div key={w.id} className="flex items-center justify-between px-4 py-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{w.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{w.type} · {w.technician_id ? "Assigned" : "Unassigned"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={w.priority || "medium"} />
                      <StatusBadge status={w.status || "open"} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      )}
    </PageWrapper>
  );
}
