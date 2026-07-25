// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

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
} from "@/components/ui";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchAssets = async () => {
  const response = await authFetch(`/api/v1/assets`).then(r => r.json());
  if (!response.ok) return [];
  return response.json();
};

const fetchWorkOrders = async () => {
  const response = await authFetch(`/api/v1/work-orders`).then(r => r.json());
  if (!response.ok) return [];
  return response.json();
};

const fetchSignals = async () => {
  const response = await authFetch(`/api/v1/ai/signals?category=maintenance`).then(r => r.json());
  if (!response.ok) return [];
  return response.json();
};

const MaintenancePage = () => {
  const { data: assets, isLoading: isAssetsLoading } = useQuery(["assets"], fetchAssets, { refetchInterval: 120000 });
  const { data: workOrders, isLoading: isWorkOrdersLoading } = useQuery(["work-orders"], fetchWorkOrders, { refetchInterval: 120000 });
  const { data: signals, isLoading: isSignalsLoading } = useQuery(["signals"], fetchSignals, { refetchInterval: 120000 });

  if (isAssetsLoading || isWorkOrdersLoading || isSignalsLoading) return <LoadingState />;

  if (!assets || !workOrders || !signals) return <EmptyState />;

  const assetHealthScores = toArr(assets).map(asset => {
    const correctiveCount = toArr(workOrders).filter(wo => wo.type === "corrective" && wo.asset_id === asset.id).length;
    const health = Math.max(0, Math.min(100, 100 - (correctiveCount * 20)));
    return { ...asset, health };
  });

  assetHealthScores.sort((a: any, b: any) => a.health - b.health);

  return (
    <PageWrapper>
      <PageHeader title="Asset Health 360" />
      <SectionCard title="Metrics">
        <MetricStrip label="Total Assets" value={(assets || []).length} />
        <MetricStrip label="Critical Assets" value={toArr(assets).filter(a => a.criticality === "critical").length} />
        <MetricStrip label="Assets In Fault" value={toArr(assets).filter(a => a.health < 40).length} />
        <MetricStrip label="High Risk Assets" value={toArr(assets).filter(a => a.health < 40).length} />
      </SectionCard>
      <SectionCard title="Asset Health Scores">
        {toArr(assetHealthScores).map(asset  => (
          <div key={asset.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
            <div className="flex items-center">
              <span>{asset.name}</span>
              <StatusBadge type={asset.criticality} />
            </div>
            <Progress value={asset.health} color={asset.health >= 70 ? "green" : asset.health >= 40 ? "amber" : "red"} />
            <span>{`${toArr(assetHealthScores).filter(a  => a.id === asset.id).length} corrective WOs in 90 days`}</span>
          </div>
        ))}
      </SectionCard>
      <SectionCard title="Maintenance Signals">
        {toArr(signals).map(signal => (
          <div key={signal.id} className="p-2 border-b last:border-b-0">
            {signal.message}
          </div>
        ))}
      </SectionCard>
    </PageWrapper>
  );
};

export default MaintenancePage;