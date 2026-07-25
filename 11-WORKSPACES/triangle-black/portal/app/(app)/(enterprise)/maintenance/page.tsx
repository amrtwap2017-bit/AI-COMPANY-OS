// @ts-nocheck
"use client";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState } from "@/components/ui";
import Link from "next/link";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchAssets = async () => {
  const response = await fetch(`${BACK}/api/v1/assets`, { credentials: "include" });
  if (!response.ok) return [];
  return response.json();
};

const fetchPMPlans = async () => {
  const response = await fetch(`${BACK}/api/v1/maintenance/pm-plans`, { credentials: "include" });
  if (!response.ok) return [];
  return response.json();
};

const fetchMaintenanceSignals = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/signals?category=maintenance`, { credentials: "include" });
// @ts-ignore
  if (!response.ok) return [];
// @ts-ignore
  return response.json();
};

const MaintenancePage = () => {
  const { data: assets, isLoading: isAssetsLoading } = useQuery(["assets"], fetchAssets, { refetchInterval: 120000 });
  const { data: pmPlans, isLoading: isPMPlansLoading } = useQuery(["pm-plans"], fetchPMPlans, { refetchInterval: 120000 });
  const { data: signals, isLoading: isSignalsLoading } = useQuery(["signals"], fetchMaintenanceSignals, { refetchInterval: 120000 });

  if (isAssetsLoading || isPMPlansLoading || isSignalsLoading) return <LoadingState />;

  const totalAssets = (assets || []).length;
  const inFaultCount = (assets || []).filter(asset => asset.status === "in-fault").length;
  const activePMPlans = pmPlans.filter(plan => plan.status === "active").length;
  const maintenanceSignals = (signals || []).slice(0, 3);

  return (
    <PageWrapper>
      <PageHeader title="Maintenance Hub" />
      <MetricStrip
        metrics={[
          { label: "Total Assets", value: totalAssets },
          { label: "In Fault", value: inFaultCount, badge: <StatusBadge status="in-fault" /> },
          { label: "Active PM Plans", value: activePMPlans },
          { label: "Maintenance Signals", value: maintenanceSignals.length }
        ]}
      />
      <div className="grid grid-cols-3 gap-4">
        <SectionCard title="Assets" description="Manage all assets" count={totalAssets} href="/maintenance/assets" />
        <SectionCard title="PM Plans" description="Review and manage PM plans" count={activePMPlans} href="/maintenance/pm-plans" />
        <SectionCard title="Intelligence" description="Analyze maintenance signals" count={(signals || []).length} href="/maintenance/intelligence" />
        <SectionCard title="Schedule" description="View and edit schedules" count={0} href="/maintenance/review/schedules" />
        <SectionCard title="Costs" description="Review maintenance costs" count={0} href="/maintenance/costs/review" />
        <SectionCard title="Downtime" description="Manage downtime" count={0} href="/maintenance/downtime/review" />
      </div>
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Current Alerts</h2>
        <ul className="list-disc pl-4">
          {maintenanceSignals.map((signal, index) => (
            <li key={index}>{signal.description}</li>
          ))}
        </ul>
      </div>
    </PageWrapper>
  );
};

export default MaintenancePage;