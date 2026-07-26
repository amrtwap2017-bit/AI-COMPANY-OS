// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

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

const workOrders: any[] = [];
const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchPMPlans() {
  try {  
    const res = await authFetch(`/api/v1/maintenance/pm-plans`).then(r => r.json());
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.items ?? data.data ?? [];
  } catch (error) {
    console.error("Error fetching PM plans:", error);
    return [];
  }
}

async function fetchWorkOrders() {
  try {  
    const res = await authFetch(`/api/v1/work-orders`).then(r => r.json());
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.items ?? (data?.work_orders || []) ?? [];
  } catch (error) {
    console.error("Error fetching work orders:", error);
    return [];
  }
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

const CalendarPage: React.FC = () => {
  const { data: pmPlans, isLoading: isPMPlansLoading, isError: isPMPlansError } = useQuery({
    queryKey: ["pm-plans"],
    queryFn: fetchPMPlans,
  });
  const maintenance: any[] = toArr(pmPlans);
const items: any[] = toArr(pmPlans);

  const { data: workOrders, isLoading: isWorkOrdersLoading, isError: isWorkOrdersError } = useQuery({
    queryKey: ["work-orders"],
    queryFn: fetchWorkOrders,
  });

  if (isPMPlansLoading || isWorkOrdersLoading) return <LoadingState />;
  if (isPMPlansError || isWorkOrdersError) return <EmptyState />;

  return (
    <PageWrapper>
      <PageHeader title="Calendar" />
      <SectionCard title="PM Plans">
        {/* Render PM plans */}
      </SectionCard>
      <SectionCard title="Work Orders">
        {/* Render work orders */}
      </SectionCard>
    </PageWrapper>
  );
};

export default CalendarPage;