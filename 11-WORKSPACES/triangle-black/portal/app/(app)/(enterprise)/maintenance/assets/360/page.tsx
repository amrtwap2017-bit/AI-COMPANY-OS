"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
  Progress,
  Button,
} from "@/components/ui";

const fetchAssets = async () => {
  const response = await fetch("/api/v1/assets", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch assets");
  return response.json();
};

const fetchWorkOrders = async () => {
  const response = await fetch("/api/v1/work-orders", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch work orders");
  return response.json();
};

const fetchMaintenanceSignals = async () => {
  const response = await fetch("/api/v1/ai/signals?category=maintenance", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch maintenance signals");
  return response.json();
};

const calculateHealthScore = (asset, workOrders) => {
  let score = 100;
  const recentWorkOrders = workOrders.filter(
    (wo) => wo.asset_id === asset.id && wo.type === "corrective" && new Date(wo.created_at).getTime() > Date.now() - 90 * 24 * 60 * 60 * 1000
  );
  score -= recentWorkOrders.length * 20;
  return Math.max(score, 0);
};

const getTopAssets = (assets, workOrders) => {
  const assetHealthScores = assets.map((asset) => ({
    ...asset,
    health_score: calculateHealthScore(asset, workOrders),
    risk_level: asset.health_score >= 70 ? "low" : asset.health_score >= 40 ? "medium" : "high",
  }));
  return assetHealthScores.sort((a, b) => a.health_score - b.health_score).slice(0, 10);
};

const MaintenancePage = () => {
  const { data: assets, isLoading: assetsLoading, isError: assetsError } = useQuery(["assets"], fetchAssets, { refetchInterval: 120000 });
  const { data: workOrders, isLoading: workOrdersLoading, isError: workOrdersError } = useQuery(["work-orders"], fetchWorkOrders, { refetchInterval: 120000 });
  const { data: maintenanceSignals, isLoading: signalsLoading, isError: signalsError } = useQuery(["maintenance-signals"], fetchMaintenanceSignals, { refetchInterval: 60000 });

  if (assetsLoading || workOrdersLoading || signalsLoading) return <LoadingState />;
  if (assetsError || workOrdersError || signalsError) return <EmptyState title="Failed to load data" description="Please try reloading the page." />;

  const topAssets = getTopAssets(assets, workOrders);

  return (
    <PageWrapper>
      <PageHeader title="Predictive Maintenance - Asset Health Scores and Failure Risk" />
      <SectionCard title="Metrics">
        <MetricStrip label="Total Assets" value={assets.length} />
        <MetricStrip label="Critical Assets" value={assets.filter((a) => a.criticality === "critical").length} />
        <MetricStrip label="In Fault" value={assets.filter((a) => a.status === "fault" || a.status === "breakdown").length} />
        <MetricStrip label="High Risk" value={topAssets.filter((a) => a.health_score < 40).length} />
      </SectionCard>
      <SectionCard title="Asset Health Score Cards">
        {topAssets.map((asset) => (
          <div key={asset.id}>
            <h3>{asset.name}</h3>
            <StatusBadge type={asset.criticality} />
            <Progress value={asset.health_score} color={asset.risk_level === "low" ? "green" : asset.risk_level === "medium" ? "amber" : "red"} />
            <p>Health: {asset.health_score}%</p>
            <p>Corrective WOs last 90 days: {workOrders.filter((wo) => wo.asset_id === asset.id && wo.type === "corrective").length}</p>
            <StatusBadge type={asset.status} />
          </div>
        ))}
      </SectionCard>
      <SectionCard title="Maintenance Signals">
        {maintenanceSignals.length > 0 ? (
          maintenanceSignals.map((signal) => (
            <div key={signal.id}>
              <h3>{signal.title}</h3>
              <p>{signal.description}</p>
              <StatusBadge type={signal.priority} />
            </div>
          ))
        ) : (
          <EmptyState title="No maintenance alerts" description="All assets are currently in good condition." />
        )}
      </SectionCard>
      <SectionCard title="Critical Assets Summary">
        {assets
          .filter((a) => a.criticality === "critical")
          .map((asset) => (
            <div key={asset.id}>
              <h3>{asset.name}</h3>
              <StatusBadge type={asset.status} />
              <StatusBadge type={asset.category} />
            </div>
          ))}
      </SectionCard>
    </PageWrapper>
  );
};

export default MaintenancePage;