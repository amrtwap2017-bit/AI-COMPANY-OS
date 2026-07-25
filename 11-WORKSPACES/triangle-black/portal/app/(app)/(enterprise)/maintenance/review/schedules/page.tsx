// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";


// Safe date formatter
const fmtDate = (d: any): string => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB"); }
  catch { return String(d).slice(0, 10); }
};

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchPlans() {
  try {  
    const r = await authFetch(`/api/v1/maintenance/pm-plans`).then(r => r.json());
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : d.items ?? [];
  } catch (error) {
    console.error("Error fetching plans:", error);
    return [];
  }
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

  const overdue   = toArr(plans).filter((p: any) => p.next_due_date && p.next_due_date < today);
  const thisWeek  = toArr(plans).filter((p: any) => p.next_due_date && p.next_due_date >= today && p.next_due_date <= w1);
  const week2     = toArr(plans).filter((p: any) => p.next_due_date && p.next_due_date > w1 && p.next_due_date <= w2);
  const week3     = toArr(plans).filter((p: any) => p.next_due_date && p.next_due_date > w2 && p.next_due_date <= w3);
  const week4     = toArr(plans).filter((p: any) => p.next_due_date && p.next_due_date > w3 && p.next_due_date <= w4);

  const thisMonth = toArr(plans).filter((p: any) => p.next_due_date && p.next_due_date >= today && p.next_due_date <= w4);

  const freqGroups = toArr(plans).reduce((acc: any, p: any) => {
    const f = p.frequency || "unknown";
    acc[f] = (acc[f] || 0) + 1;
    return acc;
  }, {});

  // Render your component here
  return (
    <PageWrapper>
      {/* Your JSX code */}
    </PageWrapper>
  );
}