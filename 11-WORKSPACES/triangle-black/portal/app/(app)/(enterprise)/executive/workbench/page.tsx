"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";;
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState } from "@/components/ui";
import Link from "next/link";

const fetchSignals = async () => {
  const response = await fetch("/api/v1/ai/signals", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch signals");
  return response.json();
};

const fetchKpisSla = async () => {
  const response = await fetch("/api/v1/ai/analytics/kpis/live", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch KPIs and SLA");
  return response.json();
};

const fetchSlas = async () => {
  const response = await fetch("/api/v1/ai/analytics/sla", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch SLAs");
  return response.json();
};

export default function ExecutiveWorkbench() {
  const signalsQuery = useQuery(["signals"], fetchSignals, { refetchInterval: 30000 });
  const kpisSlaQuery = useQuery(["kpis-sla"], fetchKpisSla, { refetchInterval: 120000 });
  const slasQuery = useQuery(["slas"], fetchSlas, { refetchInterval: 120000 });

  if (signalsQuery.isLoading || kpisSlaQuery.isLoading || slasQuery.isLoading) return <LoadingState />;

  const signals = signalsQuery.data;
  const kpisSla = kpisSlaQuery.data;
  const slas = slasQuery.data;

  const actionItems = signals.slice(0, 5).map(signal => ({
    priority: signal.priority,
    title: signal.title,
    actionLabel: "Take Action",
    href: signal.category === "operations" ? "/operations/workbench" : 
          signal.category === "maintenance" ? "/maintenance/intelligence" : 
          signal.category === "inventory" ? "/supply-chain/workbench" : 
          signal.category === "commercial" ? "/commercial/command" : "#"
  }));

  return (
    <PageWrapper>
      <PageHeader title="Good morning, CEO/COO! Current Time: {new Date().toLocaleTimeString()}" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Metrics">
          <MetricStrip label="Critical Signals" value={signals.filter(signal => signal.priority === "critical").length} />
          <MetricStrip label="Open WOs" value={signals.length} />
          <MetricStrip label="SLA %" value={kpisSla.slaCompliancePercentage} />
          <MetricStrip label="Technician Utilization %" value={kpisSla.technicianUtilizationPercentage} />
        </SectionCard>
        <SectionCard title="Action Items">
          {actionItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between mb-2">
              <span className={`text-${item.priority === "critical" ? "red" : item.priority === "high" ? "amber" : "green"}-500`}>{item.priority}</span>
              <Link href={item.href}>
                <button>{item.actionLabel}</button>
              </Link>
            </div>
          ))}
        </SectionCard>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Key Metrics - Operations">
          <MetricStrip label="Open WOs" value={signals.length} />
          <MetricStrip label="Critical WOs" value={signals.filter(signal => signal.priority === "critical").length} />
          <MetricStrip label="Completed WOs" value={signals.filter(signal => signal.status === "completed").length} />
        </SectionCard>
        <SectionCard title="Key Metrics - SLA">
          <MetricStrip label="Compliance %" value={kpisSla.slaCompliancePercentage} />
          <MetricStrip label="Target" value={slas.target} />
          <StatusBadge status={kpisSla.slaCompliancePercentage >= slas.target ? "success" : "error"} />
        </SectionCard>
      </div>
      <div className="flex overflow-x-scroll gap-4">
        <Link href="/operations/workbench" className="chip">Operations</Link>
        <Link href="/maintenance/intelligence" className="chip">Maintenance</Link>
        <Link href="/supply-chain/workbench" className="chip">Inventory</Link>
        <Link href="/commercial/command" className="chip">Commercial</Link>
        <Link href="/analytics/reports" className="chip">Analytics</Link>
        <Link href="/settings" className="chip">Settings</Link>
      </div>
    </PageWrapper>
  );
}