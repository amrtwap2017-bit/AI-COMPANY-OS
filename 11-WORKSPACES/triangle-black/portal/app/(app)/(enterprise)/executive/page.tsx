"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  MetricCard,
  StatusBadge,
  LoadingState,
  EmptyState,
  Progress,
} from "@/components/ui";

const fetchKpis = async () => {
  const response = await fetch("/api/v1/ai/analytics/kpis/live", { credentials: "include" });
  return response.json();
};

const fetchSla = async () => {
  const response = await fetch("/api/v1/ai/analytics/sla", { credentials: "include" });
  return response.json();
};

const fetchSignalsSummary = async () => {
  const response = await fetch("/api/v1/ai/signals/summary", { credentials: "include" });
  return response.json();
};

export default function ExecutivePage() {
  const kpisQuery = useQuery(["kpis"], fetchKpis, { refetchInterval: 60000 });
  const slaQuery = useQuery(["sla"], fetchSla, { refetchInterval: 60000 });
  const signalsSummaryQuery = useQuery(
    ["signalsSummary"],
    fetchSignalsSummary,
    { refetchInterval: 30000 }
  );

  if (kpisQuery.isLoading || slaQuery.isLoading || signalsSummaryQuery.isLoading) {
    return <LoadingState />;
  }

  if (kpisQuery.isError || slaQuery.isError || signalsSummaryQuery.isError) {
    return <EmptyState />;
  }

  const { work_orders, technicians, inventory, procurement } = kpisQuery.data;
  const { compliance_rate, sla_target, sla_status, total_work_orders, completed, overdue } = slaQuery.data;
  const { critical, high, total } = signalsSummaryQuery.data;

  return (
    <PageWrapper>
      <PageHeader title="Executive Dashboard" />
      <SectionCard title="Metrics">
        <MetricStrip>
          <MetricCard label="Total Work Orders" value={work_orders.total.toLocaleString()} />
          <MetricCard
            label="Critical Open"
            value={work_orders.critical_open}
            color={work_orders.critical_open > 0 ? "red" : undefined}
          />
          <MetricCard
            label="SLA Compliance %"
            value={`${compliance_rate.toFixed(2)}%`}
            color={compliance_rate < 95 ? "red" : undefined}
          />
          <MetricCard label="Active Technicians" value={technicians.active} />
          <MetricCard
            label="Technician Utilization %"
            value={`${technicians.utilization_pct.toFixed(2)}%`}
          />
          <MetricCard
            label="Total PO Value EGP"
            value={procurement.total_value_egp.toLocaleString("en-US", { style: "currency", currency: "EGP" })}
          />
        </MetricStrip>
      </SectionCard>

      <div className="grid grid-cols-2 gap-4">
        <SectionCard title="Work Order Status">
          <Progress value={Math.round((completed / total_work_orders) * 100)} label="22% completion rate" />
          <div>Open: {work_orders.open}</div>
          <div>In Progress: {work_orders.active}</div>
          <div>Critical: {work_orders.critical_open}</div>
        </SectionCard>

        <SectionCard title="SLA Performance">
          <Progress
            value={compliance_rate}
            showPercentage
            color={
              compliance_rate < 80 ? "red" : compliance_rate >= 95 ? "green" : "amber"
            }
          />
          <div>Target: {sla_target}% | Current: {compliance_rate.toFixed(2)}%</div>
          <StatusBadge status={sla_status} />
        </SectionCard>

        <SectionCard title="Technician Capacity">
          <Progress value={technicians.utilization_pct} />
          <div>Active: {technicians.active} of {technicians.total}</div>
        </SectionCard>

        <SectionCard title="Inventory Alert">
          <StatusBadge
            status={inventory.below_minimum > 0 ? "red" : undefined}
            label={`${inventory.below_minimum} items below minimum stock`}
          />
          <a href="/supply-chain/workbench">View Supply Chain →</a>
        </SectionCard>
      </div>

      <SectionCard title="Active Operational Signals">
        {critical > 0 && (
          <StatusBadge status="red" pulsing label={`${critical} critical signals`} />
        )}
        {high > 0 && (
          <StatusBadge status="amber" pulsing label={`${high} high signals`} />
        )}
        <a href="/operations/workbench">View all signals →</a>
      </SectionCard>

      <div className="grid grid-cols-2 gap-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Operations Center
        </button>
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Supply Chain
        </button>
        <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
          Maintenance
        </button>
        <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
          SLA Review
        </button>
      </div>
    </PageWrapper>
  );
}