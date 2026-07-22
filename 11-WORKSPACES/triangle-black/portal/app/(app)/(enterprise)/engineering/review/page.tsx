"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";

const fetchWorkOrders = async () => {
  const response = await fetch("/api/v1/work-orders", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch work orders");
  return response.json();
};

const fetchAssets = async () => {
  const response = await fetch("/api/v1/assets", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch assets");
  return response.json();
};

const fetchSLA = async () => {
  const response = await fetch("/api/v1/ai/analytics/sla", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch SLA data");
  return response.json();
};

const EngineeringReviewPage = () => {
  const workOrdersQuery = useQuery(["work-orders"], fetchWorkOrders, { refetchInterval: 300000 });
  const assetsQuery = useQuery(["assets"], fetchAssets, { refetchInterval: 300000 });
  const slaQuery = useQuery(["sla"], fetchSLA, { refetchInterval: 300000 });

  if (workOrdersQuery.isLoading || assetsQuery.isLoading || slaQuery.isLoading) return <LoadingState />;
  if (workOrdersQuery.isError || assetsQuery.isError || slaQuery.isError) return <EmptyState />;

  const workOrders = workOrdersQuery.data.filter((wo: any) => ["hvac", "electrical", "mechanical", "corrective", "plumbing"].includes(wo.type));
  const assetCriticalityCounts = assetsQuery.data.reduce((acc, asset: any) => {
    acc[asset.criticality] = (acc[asset.criticality] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  // Calculate metrics
  const totalWOs = workOrders.length;
  const completedWOs = workOrders.filter((wo: any) => wo.status === "completed").length;
  const completionRate = (completedWOs / totalWOs) * 100;
  const criticalOpenWOs = workOrders.filter((wo: any) => wo.status === "open" && wo.priority === "critical").length;
  const assetsInFault = assetsQuery.data.filter((asset: any) => asset.status === "faulty").length;

  // Group WO types by completion rate
  const typeBreakdown = workOrders.reduce((acc, wo: any) => {
    acc[wo.type] = (acc[wo.type] || { total: 0, completed: 0 });
    acc[wo.type].total++;
    if (wo.status === "completed") acc[wo.type].completed++;
    return acc;
  }, {} as { [key: string]: { total: number; completed: number } });

  // Calculate performance summary
  const bestType = Object.entries(typeBreakdown).reduce((acc, [type, data]) => {
    if (!acc || (data.completed / data.total) > (acc.data.completed / acc.data.total)) return { type, data };
    return acc;
  }, { type: "", data: { total: 0, completed: 0 } });

  const worstType = Object.entries(typeBreakdown).reduce((acc, [type, data]) => {
    if (!acc || (data.completed / data.total) < (acc.data.completed / acc.data.total)) return { type, data };
    return acc;
  }, { type: "", data: { total: 0, completed: 0 } });

  const overallHealthScore = completionRate;

  return (
    <PageWrapper>
      <PageHeader title="Engineering Performance Review" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SectionCard title="Metrics">
          <MetricStrip label="Engineering WOs" value={totalWOs} type="hvac/electrical/mechanical count" />
          <MetricStrip label="Completion Rate" value={`${completionRate.toFixed(2)}%`} type="percentage" />
          <MetricStrip label="Critical Open WOs" value={criticalOpenWOs} type="count" />
          <MetricStrip label="Assets in Fault" value={assetsInFault} type="count" />
        </SectionCard>
        <SectionCard title="WO Type Breakdown">
          {Object.entries(typeBreakdown).map(([type, data]) => (
            <div key={type} className="flex items-center justify-between border-b-2 py-2 last:border-b-0">
              <span>{type}</span>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  style={{ width: `${(data.completed / data.total) * 100}%`, backgroundColor: "green" }}
                  className="h-3 rounded-full"
                />
              </div>
              <span>{`${((data.completed / data.total) * 100).toFixed(2)}%`}</span>
            </div>
          ))}
        </SectionCard>
        <SectionCard title="Asset Criticality Review">
          {Object.entries(assetCriticalityCounts).map(([criticality, count]) => (
            <div key={criticality} className="flex items-center justify-between border-b-2 py-2 last:border-b-0">