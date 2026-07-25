// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchSignals = async () => {
  const res = await authFetch(`/api/v1/ai/signals`);
  if (!res.ok) return [];
  return res.json();
};

const fetchInventoryCheck = async (category: string) => {
  const res = await authFetch(`/api/v1/ai/supply/inventory-check?work_order_type=${category}`);
  if (!res.ok) return [];
  return res.json();
};

const fetchKPIs = async () => {
  const res = await authFetch(`/api/v1/ai/analytics/kpis/live`);
  if (!res.ok) return [];
  return res.json();
};

export default function Page() {
  const signalsQuery = useQuery({ queryKey: ["signals"], queryFn: fetchSignals, refetchInterval: 60000 });
  const inventoryCheckQuery = useQuery({ queryKey: ["inventory-check"], queryFn: fetchInventoryCheck, enabled: false }); // Assuming you want to disable this query initially
  const kpisQuery = useQuery({ queryKey: ["kpis"], queryFn: fetchKPIs });

  return (
    <PageWrapper>
      {/* Render your components based on the queries */}
      {signalsQuery.isLoading ? (
        <LoadingState />
      ) : signalsQuery.isError ? (
        <EmptyState error={signalsQuery.error} />
      ) : (
        <SectionCard title="Signals">
          {/* Render signals data */}
        </SectionCard>
      )}

      {inventoryCheckQuery.isLoading ? (
        <LoadingState />
      ) : inventoryCheckQuery.isError ? (
        <EmptyState error={inventoryCheckQuery.error} />
      ) : (
        <SectionCard title="Inventory Check">
          {/* Render inventory check data */}
        </SectionCard>
      )}

      {kpisQuery.isLoading ? (
        <LoadingState />
      ) : kpisQuery.isError ? (
        <EmptyState error={kpisQuery.error} />
      ) : (
        <SectionCard title="KPIs">
          {/* Render KPIs data */}
        </SectionCard>
      )}
    </PageWrapper>
  );
}