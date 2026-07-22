"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";

const fetchWorkOrders = async () => {
  const response = await fetch("/api/v1/work-orders?type=corrective&status=completed&started_at[not_null]=true&completed_at[not_null]=true", { credentials: "include" });
  return response.json();
};

const fetchAssets = async () => {
  const response = await fetch("/api/v1/assets", { credentials: "include" });
  return response.json();
};

const MaintenanceDowntimeReviewPage = () => {
  const workOrdersQuery = useQuery(["work-orders"], fetchWorkOrders, { refetchInterval: 300000 });
  const assetsQuery = useQuery(["assets"], fetchAssets, { refetchInterval: 300000 });

  if (workOrdersQuery.isLoading || assetsQuery.isLoading) return <LoadingState />;
  if (workOrdersQuery.isError || assetsQuery.isError) return <EmptyState />;

  const workOrders = workOrdersQuery.data;
  const assets = assetsQuery.data;

  // Compute downtime and MTTR
  const completedWorkOrders = workOrders.filter((wo: any) => wo.type === "corrective" && wo.status === "completed");
  const downtimeHours = completedWorkOrders.map((wo: any) => (new Date(wo.completed_at).getTime() - new Date(wo.started_at).getTime()) / 3600000);
  const avgMTTR = downtimeHours.length > 0 ? downtimeHours.reduce((a, b) => a + b, 0) / downtimeHours.length : 0;
  const longestRepair = Math.max(...downtimeHours);
  const assetsAffected = new Set(completedWorkOrders.map((wo: any) => wo.asset_id));

  // Group by asset category
  const mttrByAssetType = completedWorkOrders.reduce((acc, wo) => {
    const asset = assets.find((a: any) => a.id === wo.asset_id);
    if (asset) {
      const category = asset.category;
      acc[category] = acc[category] || { count: 0, totalHours: 0, maxHours: 0 };
      acc[category].count++;
      acc[category].totalHours += downtimeHours.find((dh, index) => dh === (new Date(wo.completed_at).getTime() - new Date(wo.started_at).getTime()) / 3600000);
      acc[category].maxHours = Math.max(acc[category].maxHours, downtimeHours[index]);
    }
    return acc;
  }, {} as { [key: string]: { count: number; totalHours: number; maxHours: number } });

  // Top 5 longest repairs
  const topLongestRepairs = completedWorkOrders.sort((a, b) => (new Date(b.completed_at).getTime() - new Date(b.started_at).getTime()) / 3600000 - (new Date(a.completed_at).getTime() - new Date(a.started_at).getTime()) / 3600000).slice(0, 5);

  return (
    <PageWrapper>
      <PageHeader title="Asset Downtime Analysis" />
      <SectionCard>
        <MetricStrip
          title="Corrective WOs Completed"
          value={completedWorkOrders.length}
        />
        <MetricStrip
          title="Avg MTTR (hours)"
          value={avgMTTR.toFixed(2)}
        />
        <MetricStrip
          title="Longest Repair (hours)"
          value={longestRepair.toFixed(2)}
        />
        <MetricStrip
          title="Assets Affected"
          value={assetsAffected.size}
        />
      </SectionCard>
      <StatusBadge status={avgMTTR < 8 ? "within target" : "exceeds target"} />
      <h3 className="mt-4 text-lg font-medium">MTTR by Asset Type</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th>Category</th>
            <th>Count</th>
            <th>Avg Hours</th>
            <th>Max Hours</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(mttrByAssetType).map(([category, data]) => (
            <tr key={category}>
              <td>{category}</td>
              <td>{data.count}</td>
              <td>{(data.totalHours / data.count).toFixed(2)}</td>
              <td>{data.maxHours.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className="mt-4 text-lg font-medium">Top 5 Longest Repairs</h3>
      <ul>
        {topLongestRepairs.map((wo: any) => (
          <li key={wo.id}>
            <strong>{wo.title}</strong> - {assets.find((a: any) => a.id === wo.asset_id).name}, {downtimeHours.find((dh, index) => dh === (new Date(wo.completed_at).getTime() - new Date(wo.started_at).getTime()) / 3600000)).toFixed(2)} hours, {new Date(wo.completed_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </PageWrapper>
  );
};

export default MaintenanceDowntimeReviewPage;