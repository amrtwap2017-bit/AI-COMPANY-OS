// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
} from "@/components/ui";


// Safe date formatter
const fmtDate = (d: any): string => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB"); }
  catch { return String(d).slice(0, 10); }
};

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchPmPlans = async () => {
  const res = await authFetch(`/api/v1/maintenance/pm-plans`);
  if (!res.ok) return [];
  return res.json();
};

const fetchAssets = async (asset_node_id: string) => {
  const res = await authFetch(`/api/v1/assets?node_id=${asset_node_id}`);
  if (!res.ok) return [];
  return res.json();
};

const PmPlansPage = () => {
  const [search, setSearch] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<{ id: string; title: string } | null>(null);

  const { data: pmPlans, isLoading, isError } = useQuery(["pm-plans"], fetchPmPlans, {
    refetchInterval: 120000,
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState message="Failed to load PM plans" />;

  const filteredPlans = toArr(pmPlans).filter((plan: any) =>
    plan.title.toLowerCase().includes(search.toLowerCase())
  );

  const today = new Date().toISOString().slice(0, 10);

  return (
    <PageWrapper>
      <PageHeader title="PM Plan 360" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total Plans", value: pmPlans.length },
            { label: "Active", value: toArr(filteredPlans).filter((p: any) => p.status === "active").length },
            {
              label: "Overdue",
              value: toArr(filteredPlans).filter((p: any) => new Date(p.next_due_date) < new Date(today)).length,
            },
            {
              label: "Due This Week",
              value: toArr(filteredPlans).filter(
                (p: any) =>
                  new Date(p.next_due_date).getTime() >= new Date(today).getTime() &&
                  new Date(p.next_due_date).getTime() <= new Date(today).getTime() + 604800000
              ).length,
            },
          ]}
        />
      </SectionCard>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {toArr(filteredPlans).map((plan: any) => (
          <div key={plan.id} onClick={() => setSelectedPlan(plan)} className="cursor-pointer p-4 border rounded hover:bg-gray-50">
            <h3 className="font-bold">{plan.title}</h3>
            <StatusBadge status={plan.status} />
            <p>{plan.frequency}</p>
            <p>{fmtDate(plan.next_due_date)}</p>
          </div>
        ))}
      </div>
      {selectedPlan && (
        <SectionCard>
          <h2 className="font-bold">{selectedPlan.title}</h2>
          <p>Type: {selectedPlan.type}</p>
          <p>Frequency: {selectedPlan.frequency}</p>
          <p>Next Due Date: {fmtDate(selectedPlan.next_due_date)}</p>
          <p>Status: {selectedPlan.status}</p>
          {/* Fetch owner name and notes */}
          {/* Fetch related asset name */}
          {/* Calculate "Due in X days" or "X days overdue" */}
        </SectionCard>
      )}
    </PageWrapper>
  );
};

export default PmPlansPage;