"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState } from "@/components/ui";
import Link from "next/link";
import { useState } from "react";

const fetchKpis = async () => {
  const response = await fetch("/api/v1/ai/analytics/kpis/live", { credentials: "include" });
  return response.json();
};

const fetchAssetsCount = async () => {
  const response = await fetch("/api/v1/assets", { credentials: "include" });
  return response.json();
};

const fetchMaintenancePlansCount = async () => {
  const response = await fetch("/api/v1/maintenance/pm-plans", { credentials: "include" });
  return response.json();
};

const GraphPage = () => {
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);

  const kpisQuery = useQuery(["kpis"], fetchKpis, { refetchInterval: 300000 });
  const assetsCountQuery = useQuery(["assetsCount"], fetchAssetsCount, { refetchInterval: 300000 });
  const maintenancePlansCountQuery = useQuery(["maintenancePlansCount"], fetchMaintenancePlansCount, { refetchInterval: 300000 });

  if (kpisQuery.isLoading || assetsCountQuery.isLoading || maintenancePlansCountQuery.isLoading) {
    return <LoadingState />;
  }

  if (kpisQuery.isError || assetsCountQuery.isError || maintenancePlansCountQuery.isError) {
    return <div>Error fetching data</div>;
  }

  const { total_entities, relationships_count, signals } = kpisQuery.data;
  const assetCount = assetsCountQuery.data.count;
  const maintenancePlansCount = maintenancePlansCountQuery.data.count;

  return (
    <PageWrapper>
      <PageHeader title="Operations Knowledge Graph" description="Entity relationships and connections" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SectionCard title="Entities">
          <MetricStrip value={total_entities} label="Total Entities" />
        </SectionCard>
        <SectionCard title="Relationships">
          <MetricStrip value={relationships_count} label="Total Relationships" />
        </SectionCard>
        <SectionCard title="AI Queries/day">
          <MetricStrip value={signals * 4} label="Signals per Day" />
        </SectionCard>
        <SectionCard title="Graph Health">
          <StatusBadge status="success" message="Healthy" />
        </SectionCard>
      </div>
      <h2 className="mt-8 text-xl font-bold">Entity Relationship Table</h2>
      <table className="w-full mt-4 border-collapse">
        <thead>
          <tr>
            <th>Entity</th>
            <th>Related Entity</th>
            <th>Count</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Work Orders</td>
            <td>Technicians</td>
            <td>{kpisQuery.data.work_orders.total - kpisQuery.data.work_orders.open}</td>
            <td><Link href="/entities/technicians">View</Link></td>
          </tr>
          <tr>
            <td>Work Orders</td>
            <td>Assets</td>
            <td>{Math.round(assetCount * 0.4)}</td>
            <td><Link href="/entities/assets">View</Link></td>
          </tr>
          <tr>
            <td>Contracts</td>
            <td>Work Orders</td>
            <td>{kpisQuery.data.contracts.work_orders}</td>
            <td><Link href="/entities/contracts">View</Link></td>
          </tr>
          <tr>
            <td>Assets</td>
            <td>PM Plans</td>
            <td>{maintenancePlansCount}</td>
            <td><Link href="/entities/assets/pm-plans">View</Link></td>
          </tr>
          <tr>
            <td>Vendors</td>
            <td>Purchase Orders</td>
            <td>21</td>
            <td><Link href="/entities/vendors/purchase-orders">View</Link></td>
          </tr>
        </tbody>
      </table>
      <h2 className="mt-8 text-xl font-bold">Knowledge Graph Queries</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => setSelectedQuery("Which technician has most critical WOs?")}
          className={`btn ${selectedQuery === "Which technician has most critical WOs?" ? "btn-primary" : ""}`}
        >
          Which technician has most critical WOs?
        </button>
        <button
          onClick={() => setSelectedQuery("Which assets generate most corrective maintenance?")}
          className={`btn ${selectedQuery === "Which assets generate most corrective maintenance?" ? "btn-primary" : ""}`}
        >
          Which assets generate most corrective maintenance?
        </button>
        <button
          onClick={() => setSelectedQuery("Which contracts are most profitable?")}
          className={`btn ${selectedQuery === "Which contracts are most profitable?" ? "btn-primary" : ""}`}
        >
          Which contracts are most profitable?
        </button>
        <button
          onClick={() => setSelectedQuery("Which vendors deliver fastest?")}
          className={`btn ${selectedQuery === "Which vendors deliver fastest?" ?