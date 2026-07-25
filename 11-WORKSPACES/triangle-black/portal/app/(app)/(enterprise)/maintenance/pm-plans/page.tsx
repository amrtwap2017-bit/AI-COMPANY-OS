// @ts-nocheck
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchPlans() {
  try {  
    const r = await fetch(`${BACK}/api/v1/maintenance/pm-plans`, { credentials: "include" });
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d : d.items ?? d.data ?? [];
  } catch (error) {
    console.error("Error fetching plans:", error);
    return [];
  }
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

  return (
    <PageWrapper>
      {/* Your component JSX here */}
    </PageWrapper>
  );
}