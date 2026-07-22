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
} from "@/components/ui";

const today = new Date().toISOString().slice(0, 10);

const fetchSignals = async () =>
  fetch("/api/v1/ai/signals?category=maintenance", { credentials: "include" }).then(
    (res) => res.json()
  );

const fetchAssets = async () =>
  fetch("/api/v1/assets", { credentials: "include" }).then((res) => res.json());

const fetchPMPlans = async () =>
  fetch("/api/v1/maintenance/pm-plans", { credentials: "include" }).then(
    (res) => res.json()
  );

const MaintenanceIntelligencePage = () => {
  const signalsQuery = useQuery(["signals"], fetchSignals, {
    refetchInterval: 30000,
  });
  const assetsQuery = useQuery(["assets"], fetchAssets, {
    refetchInterval: 60000,
  });
  const pmPlansQuery = useQuery(["pm-plans"], fetchPMPlans, {
    refetchInterval: 60000,
  });

  if (signalsQuery.isLoading || assetsQuery.isLoading || pmPlansQuery.isLoading) {
    return <LoadingState />;
  }

  if (signalsQuery.isError || assetsQuery.isError || pmPlansQuery.isError) {
    return <EmptyState message="Failed to load data" />;
  }

  const signals = signalsQuery.data.filter(
    (signal: any) => signal.category === "maintenance" || signal.category === "operations"
  );
  const criticalAssets = assetsQuery.data.filter((asset: any) => asset.criticality === "critical");
  const faultAssets = assetsQuery.data.filter((asset: any) => asset.status === "fault" || asset.status === "breakdown");
  const overduePMPlans = pmPlansQuery.data.filter(
    (plan: any) => new Date(plan.next_due_date).toISOString().slice(0, 10) < today
  );

  return (
    <PageWrapper>
      <PageHeader title="Maintenance Intelligence" />
      <div className="grid grid-cols-3 gap-4">
        <MetricStrip title="Maintenance Signals" value={signals.length} />
        <MetricStrip title="Critical Assets" value={criticalAssets.length} />
        <MetricStrip title="Assets in Fault" value={faultAssets.length} />
        <MetricStrip title="PM Plans Overdue" value={overduePMPlans.length} />
      </div>
      <SectionCard title="Maintenance Signals">
        {signals.map((signal: any) => (
          <div key={signal.id} className={`border-l-4 ${signal.priority === "high" ? "border-red-500" : signal.priority === "medium" ? "border-yellow-500" : "border-blue-500"} p-2`}>
            <h3>{signal.title}</h3>
            <p>{signal.message}</p>
            <button className="bg-green-500 text-white px-2 py-1">{signal.recommended_action}</button>
          </div>
        ))}
      </SectionCard>
      <SectionCard title="Asset Risk Overview">
        {faultAssets.slice(0, 5).map((asset: any) => (
          <div key={asset.id} className="p-2 border-b">
            <h3>{asset.name}</h3>
            <span className="mr-2">{asset.category}</span>
            <StatusBadge status={asset.status} />
            <CriticalityBadge criticality={asset.criticality} />
          </div>
        ))}
        {criticalAssets.slice(0, 5 - faultAssets.length).map((asset: any) => (
          <div key={asset.id} className="p-2 border-b">
            <h3>{asset.name}</h3>
            <span className="mr-2">{asset.category}</span>
            <StatusBadge status={asset.status} />
            <CriticalityBadge criticality={asset.criticality} />
          </div>
        ))}
      </SectionCard>
      <SectionCard title="PM Plan Overdue List">
        {overduePMPlans.map((plan: any) => (
          <div key={plan.id} className="p-2 border-b">
            <h3>{plan.title}</h3>
            <span className="mr-2">{plan.frequency}</span>
            <span className="mr-2">{plan.next_due_date}</span>
            <span className="bg-red-500 text-white px-2 py-1">{new Date().toISOString().slice(0, 10) - new Date(plan.next_due_date).toISOString().slice(0, 10)} days overdue</span>
          </div>
        ))}
      </SectionCard>
    </PageWrapper>
  );
};

export default MaintenanceIntelligencePage;