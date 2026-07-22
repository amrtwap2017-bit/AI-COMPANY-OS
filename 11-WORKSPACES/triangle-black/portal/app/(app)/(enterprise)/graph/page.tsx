"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState } from "@/components/ui";
import Link from "next/link";

const fetchKpis = async () => {
  const response = await fetch("/api/v1/ai/analytics/kpis/live", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch KPIs");
  return response.json();
};

const fetchSignalsSummary = async () => {
  const response = await fetch("/api/v1/ai/signals/summary", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch Signals Summary");
  return response.json();
};

const GraphPage = () => {
  const { data: kpis, isLoading } = useQuery(["kpis"], fetchKpis, { refetchInterval: 300000 });
  const { data: signalsSummary, isLoading: signalsLoading } = useQuery(["signalsSummary"], fetchSignalsSummary, { refetchInterval: 300000 });

  if (isLoading || signalsLoading) return <LoadingState />;

  const totalEntities = kpis.WOs + kpis.technicians + kpis.assets + kpis.contracts;
  const connections = kpis.WOs * kpis.technicians; // Simplified for example

  return (
    <PageWrapper>
      <PageHeader title="Operations Knowledge Graph" note="Entity relationships in Triangle Black" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Entities", value: totalEntities },
            { label: "Connections", value: connections },
            { label: "Signals", value: signalsSummary.totalSignals },
            { label: "Data Points", value: signalsSummary.dataPoints }
          ]}
        />
      </SectionCard>
      <SectionCard title="Entity Relationship Summary">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th>Entity</th>
              <th>Related Entity</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Work Orders</td>
              <td>Technicians</td>
              <td>{kpis.WOs * kpis.technicians}</td>
            </tr>
            <tr>
              <td>Work Orders</td>
              <td>Assets</td>
              <td>{kpis.WOsWithAssetId}</td>
            </tr>
            <tr>
              <td>Contracts</td>
              <td>Work Orders</td>
              <td>{kpis.WOsWithContractId}</td>
            </tr>
            <tr>
              <td>Assets</td>
              <td>PM Plans</td>
              <td>{signalsSummary.plansWithAssetNodeId}</td>
            </tr>
          </tbody>
        </table>
      </SectionCard>
      <SectionCard title="Quick Navigation">
        <div className="grid grid-cols-2 gap-4">
          <Link href="/operations/work-orders" className="bg-white p-4 rounded-lg shadow hover:bg-gray-100">
            Work Orders
          </Link>
          <Link href="/operations/technicians" className="bg-white p-4 rounded-lg shadow hover:bg-gray-100">
            Technicians
          </Link>
          <Link href="/maintenance/assets" className="bg-white p-4 rounded-lg shadow hover:bg-gray-100">
            Assets
          </Link>
          <Link href="/contracts/360" className="bg-white p-4 rounded-lg shadow hover:bg-gray-100">
            Contracts 360
          </Link>
        </div>
      </SectionCard>
    </PageWrapper>
  );
};

export default GraphPage;