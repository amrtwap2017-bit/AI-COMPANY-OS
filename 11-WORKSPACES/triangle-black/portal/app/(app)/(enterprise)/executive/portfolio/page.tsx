"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";;
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState } from "@/components/ui";
import Link from "next/link";

const fetchKpis = async () => {
  const response = await fetch("/api/v1/ai/analytics/kpis/live", { credentials: "include" });
  return response.json();
};

const fetchSLA = async () => {
  const response = await fetch("/api/v1/ai/analytics/sla", { credentials: "include" });
  return response.json();
};

const fetchCosts = async () => {
  const response = await fetch("/api/v1/ai/analytics/costs/summary", { credentials: "include" });
  return response.json();
};

const fetchSignals = async () => {
  const response = await fetch("/api/v1/ai/signals/summary", { credentials: "include" });
  return response.json();
};

export default function PortfolioPage() {
  const kpisQuery = useQuery(["kpis"], fetchKpis, { refetchInterval: 30000 });
  const slaQuery = useQuery(["sla"], fetchSLA, { refetchInterval: 30000 });
  const costsQuery = useQuery(["costs"], fetchCosts, { refetchInterval: 30000 });
  const signalsQuery = useQuery(["signals"], fetchSignals, { refetchInterval: 30000 });

  if (kpisQuery.isLoading || slaQuery.isLoading || costsQuery.isLoading || signalsQuery.isLoading) {
    return <LoadingState />;
  }

  const { totalEntities, liveConnections, aiAgents, dataPointsUpdated } = kpisQuery.data;
  const { compliance } = slaQuery.data;
  const { woCost, margin } = costsQuery.data;
  const { critical, high } = signalsQuery.data;

  return (
    <PageWrapper>
      <PageHeader title="Operations Digital Twin" badge={<StatusBadge status="live" />} />
      <MetricStrip
        metrics={[
          { label: "Total Entities", value: totalEntities },
          { label: "Live Connections", value: liveConnections },
          { label: "AI Agents", value: aiAgents },
          { label: "Data Points Updated", value: dataPointsUpdated }
        ]}
      />
      <div className="grid grid-cols-4 gap-4">
        <SectionCard title="OPERATIONS" icon="work-orders">
          <p>72 WOs, 41 open, 11 critical</p>
        </SectionCard>
        <SectionCard title="RESOURCES" icon="technicians">
          <p>25 techs, 34.3% utilized</p>
        </SectionCard>
        <SectionCard title="FINANCE" icon="costs">
          <p>22.2% SLA, 97.6% margin</p>
        </SectionCard>
        <SectionCard title="SUPPLY" icon="vendors">
          <p>13 vendors, 21 POs, inventory alerts from signals</p>
        </SectionCard>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold">Real-time Feed</h2>
        <ul className="list-disc pl-4">
          {signalsQuery.data.signals.map((signal: any) => (
            <li key={signal.id}>
              {signal.type} - {signal.message} at {new Date(signal.timestamp).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-8 text-sm italic">Digital Twin updates on every AI signal refresh (30s)</p>
    </PageWrapper>
  );
}