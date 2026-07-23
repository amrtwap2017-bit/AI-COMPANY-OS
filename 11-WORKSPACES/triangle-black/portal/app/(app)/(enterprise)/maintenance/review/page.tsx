"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";;
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState } from "@/components/ui";
import Link from "next/link";

const fetchAssets = async () => {
  const response = await fetch("/api/v1/assets", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch assets");
  return response.json();
};

const fetchPMPlans = async () => {
  const response = await fetch("/api/v1/maintenance/pm-plans", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch PM plans");
  return response.json();
};

const fetchMaintenanceSignals = async () => {
  const response = await fetch("/api/v1/ai/signals?category=maintenance", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch maintenance signals");
  return response.json();
};

const MaintenanceReviewPage = () => {
  const { data: assets, isLoading: isAssetsLoading } = useQuery(["assets"], fetchAssets, { refetchInterval: 120000 });
  const { data: pmPlans, isLoading: isPMPlansLoading } = useQuery(["pm-plans"], fetchPMPlans, { refetchInterval: 120000 });
  const { data: maintenanceSignals, isLoading: isMaintenanceSignalsLoading } = useQuery(
    ["maintenance-signals"],
    fetchMaintenanceSignals,
    { refetchInterval: 120000 }
  );

  if (isAssetsLoading || isPMPlansLoading || isMaintenanceSignalsLoading) return <LoadingState />;

  const totalAssets = assets.length;
  const activePMPlans = pmPlans.filter(plan => plan.status === "active").length;
  const overduePMPlans = pmPlans.filter(plan => new Date(plan.dueDate) < new Date()).length;
  const maintenanceSignalsCount = maintenanceSignals.length;

  return (
    <PageWrapper>
      <PageHeader title="Maintenance Review Hub" />
      <div className="grid grid-cols-3 gap-4">
        <MetricStrip label="Total Assets" value={totalAssets} />
        <MetricStrip label="PM Plans Active" value={activePMPlans} />
        <MetricStrip label="Overdue PM Plans" value={overduePMPlans} />
        <MetricStrip label="Maintenance Signals" value={maintenanceSignalsCount} />
      </div>
      <div className="grid grid-cols-6 gap-4 mt-8">
        <SectionCard title="Schedule">
          <Link href="/maintenance/review/schedules">Go to Schedules</Link>
        </SectionCard>
        <SectionCard title="Costs">
          <Link href="/maintenance/costs/review">Go to Costs Review</Link>
        </SectionCard>
        <SectionCard title="Downtime">
          <Link href="/maintenance/downtime/review">Go to Downtime Review</Link>
        </SectionCard>
        <SectionCard title="Intelligence">
          <Link href="/maintenance/intelligence">Go to Intelligence</Link>
        </SectionCard>
        <SectionCard title="Asset Tree">
          <Link href="/maintenance/asset-tree">Go to Asset Tree</Link>
        </SectionCard>
        <SectionCard title="PM Plans">
          <Link href="/maintenance/pm-plans">Go to PM Plans</Link>
        </SectionCard>
      </div>
      <StatusBadge
        label="Quick Status"
        value={`${overduePMPlans} overdue PM plans + ${maintenanceSignalsCount} faulted assets`}
      />
    </PageWrapper>
  );
};

export default MaintenanceReviewPage;