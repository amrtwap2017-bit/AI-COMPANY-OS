"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, Progress } from "@/components/ui";
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

const ExecutivePage = () => {
  const kpisQuery = useQuery(["kpis"], fetchKpis, { refetchInterval: 60000 });
  const slaQuery = useQuery(["sla"], fetchSLA, { refetchInterval: 30000 });
  const costsQuery = useQuery(["costs"], fetchCosts, { refetchInterval: 300000 });
  const signalsQuery = useQuery(["signals"], fetchSignals, { refetchInterval: 30000 });

  if (kpisQuery.isLoading || slaQuery.isLoading || costsQuery.isLoading || signalsQuery.isLoading) {
    return <LoadingState />;
  }

  if (kpisQuery.isError || slaQuery.isError || costsQuery.isError || signalsQuery.isError) {
    return <div>Error fetching data</div>;
  }

  const { totalWOs, criticalWOs } = kpisQuery.data;
  const { compliancePercentage, status } = slaQuery.data;
  const { totalCost, marginPercentage } = costsQuery.data;
  const { criticalSignals, highSignals } = signalsQuery.data;

  return (
    <PageWrapper>
      <PageHeader title="Executive Dashboard" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricStrip label="Critical WOs" value={criticalWOs} />
        <MetricStrip label="SLA %" value={compliancePercentage.toFixed(2)} />
        <MetricStrip label="Portfolio Revenue EGP" value={totalCost} />
        <MetricStrip label="Gross Margin %" value={marginPercentage.toFixed(2)} />
        <MetricStrip label="Active Signals" value={criticalSignals + highSignals} />
        <MetricStrip label="Tech Utilization %" value="75%" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Operational Health">
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <span>WOs</span>
              <Progress value={75} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span>SLA Compliance</span>
              {status === "AT RISK" ? (
                <StatusBadge status="at-risk" label={`${compliancePercentage.toFixed(2)}%`} />
              ) : (
                <StatusBadge status="good" label={`${compliancePercentage.toFixed(2)}%`} />
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span>Cost</span>
              <Progress value={95} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span>Resources</span>
              <Progress value={80} />
            </div>
          </div>
        </SectionCard>
      </div>
      {criticalSignals > 0 && (
        <StatusBadge status="alert" label="Critical Signals" className="mt-4" />
      )}
      <div className="flex justify-between mt-4">
        <Link href="/operations">Operations</Link>
        <Link href="/supply">Supply</Link>
        <Link href="/maintenance">Maintenance</Link>
        <Link href="/analytics-costs">Analytics/Costs</Link>
        <Link href="/reports">Reports</Link>
      </div>
      <div className="mt-4 text-sm">
        Last refresh: {new Date().toLocaleString()}
      </div>
    </PageWrapper>
  );
};

export default ExecutivePage;