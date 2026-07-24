"use client"; // @ts-nocheck

import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState, Progress } from "@/components/ui";
import { useQuery } from "@tanstack/react-query";

const fetchSignals = async () => {
  const response = await fetch("/api/v1/ai/signals", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch signals");
  return response.json();
};

const fetchKpis = async () => {
  const response = await fetch("/api/v1/ai/analytics/kpis/live", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch KPIs");
  return response.json();
};

const fetchAssets = async () => {
  const response = await fetch("/api/v1/assets?category=HVAC,Electrical,Mechanical,Elevator", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch assets");
  return response.json();
};

const fetchPmPlans = async () => {
  const response = await fetch("/api/v1/maintenance/pm-plans", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch PM plans");
  return response.json();
};

const EngineeringPage = () => {
  const signalsQuery = useQuery(["signals"], fetchSignals, { refetchInterval: 30000 });
  const kpisQuery = useQuery(["kpis"], fetchKpis, { refetchInterval: 60000 });
  const assetsQuery = useQuery(["assets"], fetchAssets, { refetchInterval: 60000 });
  const pmPlansQuery = useQuery(["pm-plans"], fetchPmPlans, { refetchInterval: 60000 });

  if (signalsQuery.isLoading || kpisQuery.isLoading || assetsQuery.isLoading || pmPlansQuery.isLoading) {
    return <LoadingState />;
  }

  if (signalsQuery.isError || kpisQuery.isError || assetsQuery.isError || pmPlansQuery.isError) {
    return <EmptyState message="Failed to load data" />;
  }

  const signals = signalsQuery.data.filter(signal => signal.category === "engineering");
  const criticalSignals = signals.filter(signal => signal.priority === "critical");
  const openWorkOrders = kpisQuery.data.open_work_orders.filter(wo => wo.status === "open");

  const assets = assetsQuery.data;
  const healthScores = assets.map(asset => {
    let health = 100;
    const correctiveWos = kpisQuery.data.work_orders.filter(wo => wo.asset_id === asset.id && wo.type === "corrective");
    health -= correctiveWos.length * 20;
    return { ...asset, health };
  }).sort((a, b) => a.health - b.health);

  const pmPlans = pmPlansQuery.data;
  const overduePlans = pmPlans.filter(plan => new Date(plan.next_due_date) < new Date());
  const dueSoonPlans = pmPlans.filter(plan => new Date(plan.next_due_date) >= new Date() && new Date(plan.next_due_date) <= new Date(new Date().setDate(new Date().getDate() + 14)));

  return (
    <PageWrapper>
      <PageHeader title="Engineering Dashboard" />
      <SectionCard title="Engineering Metrics">
        <MetricStrip
          metrics={[
            { label: "Total Engineering Assets", value: assets.length },
            { label: "Critical Signals", value: criticalSignals.length, badgeColor: "red" },
            { label: "Open Work Orders", value: openWorkOrders.length, badgeColor: "orange" },
            { label: "PM Plans Due", value: overduePlans.length + dueSoonPlans.length }
          ]}
        />
      </SectionCard>
      <SectionCard title="Live Engineering Signals">
        <Progress
          items={signals.map(signal => ({
            priorityBorder: signal.priority === "critical" ? "red" : signal.priority === "high" ? "orange" : "blue",
            title: signal.title,
            message: signal.message,
            action: signal.action
          }))}
          groupByPriority
        />
      </SectionCard>
      <SectionCard title="Engineering Asset Health">
        <Progress
          items={healthScores.slice(0, 8).map(asset => ({
            name: asset.name,
            category: asset.category,
            health: `${asset.health}%`,
            badgeColor: asset.health < 50 ? "red" : asset.health < 75 ? "orange" : "green"
          }))}
        />
      </SectionCard>
      <SectionCard title="PM Schedule Summary">
        <Progress
          items={[
            { label: "Overdue", value: overduePlans.length, badgeColor: "red" },
            { label: "Due Soon", value: dueSoonPlans.length, badgeColor: "orange" },
            { label: "Active", value: pmPlans.length - overduePlans.length - dueSoonPlans.length, badgeColor: "green" }
          ]}
        />
      </SectionCard>
    </PageWrapper>
  );
};

export default EngineeringPage;