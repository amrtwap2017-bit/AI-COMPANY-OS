"use client"; // @ts-nocheck
// @ts-nocheck

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

const fetchSignals = async () => {
  const response = await fetch("/api/v1/ai/signals?category=maintenance", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch signals");
  return response.json();
};

const MaintenanceReviewPage = () => {
  const { data: assets, isLoading: isAssetsLoading } = useQuery(["assets"], fetchAssets, {
    refetchInterval: 120000,
  });
  const { data: pmPlans, isLoading: isPMPlansLoading } = useQuery(["pm-plans"], fetchPMPlans, {
    refetchInterval: 120000,
  });
  const { data: signals, isLoading: isSignalsLoading } = useQuery(["signals"], fetchSignals, {
    refetchInterval: 120000,
  });

  if (isAssetsLoading || isPMPlansLoading || isSignalsLoading) return <LoadingState />;

  if (!assets || !pmPlans || !signals) return <EmptyState />;

  const totalAssets = assets.length;
  const criticalAssets = assets.filter((asset) => asset.criticality === "critical").length;
  const inFault = assets.filter((asset) => asset.status === "fault").length;
  const underMaintenance = assets.filter((asset) => asset.status === "under_maintenance").length;

  const pmPlansDueSoon = pmPlans.filter(
    (plan) =>
      new Date(plan.next_due_date).toISOString().split("T")[0] >=
      new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split("T")[0]
  );

  return (
    <PageWrapper>
      <PageHeader title="Maintenance Manager Review" />
      <div className="grid grid-cols-3 gap-6">
        <MetricStrip label="Total Assets" value={totalAssets} />
        <MetricStrip label="Critical Assets" value={criticalAssets} color="red" />
        <MetricStrip label="In Fault" value={inFault} color="red" />
        <MetricStrip label="Active PM Plans" value={pmPlans.filter((plan) => plan.status === "active").length} />
      </div>
      <SectionCard title="Assets by Status">
        <Progress
          values={[
            { label: "Operational", value: assets.filter((asset) => asset.status === "operational").length, color: "green" },
            { label: "Fault", value: inFault, color: "red" },
            { label: "Under Maintenance", value: underMaintenance, color: "yellow" },
          ]}
        />
      </SectionCard>
      <SectionCard title="PM Plans Due Soon">
        {pmPlansDueSoon.length === 0 ? (
          <EmptyState message="No PM plans due soon." />
        ) : (
          pmPlansDueSoon.map((plan) => (
            <div key={plan.title} className="flex items-center justify-between mb-2">
              <Link href={`/maintenance/pm-plans/${plan.id}`}>
                {plan.title}
              </Link>
              <StatusBadge status={plan.status} />
              <span>{plan.next_due_date}</span>
            </div>
          ))
        )}
      </SectionCard>
      <SectionCard title="Maintenance Signals">
        {signals.length === 0 ? (
          <EmptyState message="No maintenance signals." />
        ) : (
          signals.map((signal) => (
            <div key={signal.id} className={`bg-${signal.color}-100 p-4 rounded mb-2`}>
              <h3>{signal.title}</h3>
              <p>{signal.description}</p>
            </div>
          ))
        )}
      </SectionCard>
    </PageWrapper>
  );
};

export default MaintenanceReviewPage;