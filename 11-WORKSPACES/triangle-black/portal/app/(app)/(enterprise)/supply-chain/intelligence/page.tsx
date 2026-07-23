"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";;
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
  const signalsQuery = useQuery(["signals"], fetchSignals, { refetchInterval: 60000 });
  const inventoryCheckQuery = useQuery(["inventory-check", "hvac"], () => fetchInventoryCheck("hvac"), { refetchInterval: 120000 });
  const kpisQuery = useQuery(["kpis"], fetchKPIs, { refetchInterval: 60000 });

  if (signalsQuery.isLoading || inventoryCheckQuery.isLoading || kpisQuery.isLoading) return <LoadingState />;
  if (signalsQuery.isError || inventoryCheckQuery.isError || kpisQuery.isError) return <EmptyState />;

  const signals = signalsQuery.data;
  const inventoryCheck = inventoryCheckQuery.data;
  const kpis = kpisQuery.data;

  return (
    <PageWrapper>
      <PageHeader title="AI-Powered Supply Chain Intelligence" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricStrip title="AI Signals Total" value={signals.total} />
        <MetricStrip title="Inventory Alerts" value={inventoryCheck.out_of_stock_count} badgeColor="red" />
        <MetricStrip title="Out of Stock" value={inventoryCheck.out_of_stock_count} badgeColor="red" />
        <MetricStrip title="Procurement Actions Needed" value={kpis.procurement_actions_needed} />
      </div>
      <SectionCard title="AI Recommendations">
        {signals.signals.map(signal => (
          <div key={signal.id} className="p-4 border rounded-md mb-2">
            <h3>{signal.title}</h3>
            <p>{signal.recommended_action}</p>
            {signal.type === "inventory" && (
              <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Auto-PR Available</button>
            )}
          </div>
        ))}
      </SectionCard>
      <SectionCard title="Live Inventory Intelligence">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["hvac", "electrical", "plumbing"].map(category => (
            <div key={category} className="p-4 border rounded-md">
              <h3>{category}</h3>
              <p>Available Count: {inventoryCheck[`${category}_available_count`]}</p>
              <p>Out of Stock: {inventoryCheck[`${category}_out_of_stock_count`]}</p>
              <p>Below Min: {inventoryCheck[`${category}_below_min_count`]}</p>
              <StatusBadge
                value={inventoryCheck[`${category}_out_of_stock_count`]}
                color="red"
                label="Out of Stock"
              />
              <StatusBadge
                value={inventoryCheck[`${category}_below_min_count`]}
                color="amber"
                label="Below Min"
              />
              <StatusBadge
                value={inventoryCheck[`${category}_available_count`]}
                color="green"
                label="OK"
              />
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Smart Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/supply-chain/workbench" className="p-4 border rounded-md bg-blue-500 text-white">Create Purchase Request</a>
          <a href="/supply-chain/vendors/analytics" className="p-4 border rounded-md bg-green-500 text-white">Review Vendors</a>
          <a href="/supply-chain/rfqs" className="p-4 border rounded-md bg-yellow-500 text-white">Check RFQs</a>
        </div>
      </SectionCard>
    </PageWrapper>
  );
}