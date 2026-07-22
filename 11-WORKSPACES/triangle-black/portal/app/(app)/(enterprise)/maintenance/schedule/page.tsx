"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";

const fetchPMPlans = async (startOfWeek: string) => {
  const response = await fetch(`/api/v1/maintenance/pm-plans?start_date=${startOfWeek}&end_date=${new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10)}`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch PM plans");
  return response.json();
};

const fetchWOs = async (startOfWeek: string) => {
  const response = await fetch(`/api/v1/work-orders?start_date=${startOfWeek}&end_date=${new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10)}`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch WOs");
  return response.json();
};

const MaintenanceSchedulePage = () => {
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const startOfWeek = new Date(Date.now() + weekOffset * 7 * 86400000).toISOString().slice(0, 10);
  const endOfWeek = new Date(Date.now() + (weekOffset + 6) * 86400000).toISOString().slice(0, 10);

  const { data: pmPlansData, isLoading: pmPlansLoading, isError: pmPlansError } = useQuery(["pm-plans", startOfWeek], () => fetchPMPlans(startOfWeek), { refetchInterval: 120000 });
  const { data: wosData, isLoading: wosLoading, isError: wosError } = useQuery(["wos", startOfWeek], () => fetchWOs(startOfWeek), { refetchInterval: 120000 });

  if (pmPlansLoading || wosLoading) return <LoadingState />;
  if (pmPlansError || wosError) return <EmptyState />;

  const pmPlans = pmPlansData as { next_due_date: string }[];
  const wos = wosData as { due_date: string }[];

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayGrid = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek).setDate(new Date(startOfWeek).getDate() + i);
    return {
      date,
      pmPlans: pmPlans.filter(plan => plan.next_due_date === new Date(date).toISOString().slice(0, 10)),
      wos: wos.filter(wo => wo.due_date === new Date(date).toISOString().slice(0, 10))
    };
  });

  const thisWeekPlans = dayGrid.reduce((acc, day) => acc + day.pmPlans.length, 0);
  const thisWeekWOs = dayGrid.reduce((acc, day) => acc + day.wos.length, 0);
  const overdue = pmPlans.filter(plan => new Date(plan.next_due_date) < new Date()).length;
  const totalScheduled = thisWeekPlans + thisWeekWOS;

  return (
    <PageWrapper>
      <PageHeader title="Maintenance Schedule" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "This Week Plans", value: thisWeekPlans, color: "blue" },
            { label: "This Week WOs", value: thisWeekWOs, color: "amber" },
            { label: "Overdue", value: overdue, color: "red" },
            { label: "Total Scheduled", value: totalScheduled }
          ]}
        />
      </SectionCard>
      <div className="flex justify-between mb-4">
        <button onClick={() => setWeekOffset(weekOffset - 1)} disabled={weekOffset === 0}>← Previous Week</button>
        <span>Week of {new Date(startOfWeek).toLocaleDateString()}</span>
        <button onClick={() => setWeekOffset(weekOffset + 1)}>Next Week →</button>
      </div>
      <div className="grid grid-cols-7 gap-4">
        {dayGrid.map((day, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-md">
            <h3>{daysOfWeek[index]}</h3>
            <ul>
              {day.pmPlans.length > 0 && day.pmPlans.map((plan, i) => (
                <li key={i} className="text-blue-500">{plan.next_due_date}</li>
              ))}
              {day.wos.length > 0 && day.wos.map((wo, i) => (
                <li key={i} className="text-amber-500">{wo.due_date}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
};

export default MaintenanceSchedulePage;