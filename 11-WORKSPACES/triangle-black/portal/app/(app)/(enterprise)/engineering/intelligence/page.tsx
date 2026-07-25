// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState, Progress } from "@/components/ui";
import { useQuery } from "@tanstack/react-query";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchSignals = async () => {
  const res = await authFetch(`/api/v1/ai/signals`);
  if (!res.ok) return [];
  return res.json();
};

const fetchKpis = async () => {
  const res = await authFetch(`/api/v1/ai/analytics/kpis/live`);
  if (!res.ok) return [];
  return res.json();
};

const fetchAssets = async () => {
  const res = await authFetch(`/api/v1/assets?category=HVAC,Electrical,Mechanical,Elevator`);
  if (!res.ok) return [];
  return res.json();
};

const MyComponent = () => {
  const signalsQuery = useQuery({ queryKey: ["signals"], queryFn: fetchSignals });
  const kpisQuery = useQuery({ queryKey: ["kpis"], queryFn: fetchKpis });
  const assetsQuery = useQuery({ queryKey: ["assets"], queryFn: fetchAssets });

  if (signalsQuery.isError || kpisQuery.isError || assetsQuery.isError) {
    return <EmptyState message="Failed to load data" />;
  }

  const signals = (signalsQuery.data?.signals || signalsQuery.data || []).filter(signal => signal.category === "engineering");
  const criticalSignals = toArr(signals).filter(signal => signal.priority === "critical");
  const openWorkOrders = kpisQuery.data?.toArr(open_work_orders).filter(wo => wo.status === "open");

  const assets = assetsQuery.data;
  const healthScores = toArr(assets).map(asset => {
    // Your logic here
  });

  return (
    <PageWrapper>
      {/* Your JSX here */}
    </PageWrapper>
  );
};

export default MyComponent;