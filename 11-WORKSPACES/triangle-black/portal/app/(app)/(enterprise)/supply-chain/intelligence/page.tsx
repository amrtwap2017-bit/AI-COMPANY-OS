"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";

const fetchSignals = async () => {
  const response = await fetch("/api/v1/ai/signals", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch signals");
  return response.json();
};

const fetchInventoryCheck = async (category: string) => {
  const response = await fetch(`/api/v1/ai/supply/inventory-check?work_order_type=${category}`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch inventory check");
  return response.json();
};

const fetchKPIs = async () => {
  const response = await fetch("/api/v1/ai/analytics/kpis/live", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch KPIs");
  return response.json();
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