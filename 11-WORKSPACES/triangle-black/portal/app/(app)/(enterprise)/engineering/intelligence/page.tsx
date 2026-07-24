"use client"; // @ts-nocheck

import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState, Progress } from "@/components/ui";
import { useQuery } from "@tanstack/react-query";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchSignals = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/signals`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch signals");
  return response.json();
};

const fetchKpis = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/analytics/kpis/live`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch KPIs");
  return response.json();
};

const fetchAssets = async () => {
  const response = await fetch(`${BACK}/api/v1/assets?category=HVAC,Electrical,Mechanical,Elevator`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch assets");
  return response.json();
};

const MyComponent = () => {
  const signalsQuery = useQuery({ queryKey: ["signals"], queryFn: fetchSignals });
  const kpisQuery = useQuery({ queryKey: ["kpis"], queryFn: fetchKpis });
  const assetsQuery = useQuery({ queryKey: ["assets"], queryFn: fetchAssets });

  if (signalsQuery.isError || kpisQuery.isError || assetsQuery.isError) {
    return <EmptyState message="Failed to load data" />;
  }

  const signals = (signalsQuery.data || []).filter(signal => signal.category === "engineering");
  const criticalSignals = signals.filter(signal => signal.priority === "critical");
  const openWorkOrders = kpisQuery.data?.(open_work_orders || []).filter(wo => wo.status === "open");

  const assets = assetsQuery.data;
  const healthScores = (assets || []).map(asset => {
    // Your logic here
  });

  return (
    <PageWrapper>
      {/* Your JSX here */}
    </PageWrapper>
  );
};

export default MyComponent;