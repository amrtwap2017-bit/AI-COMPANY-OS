// @ts-nocheck
"use client";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState } from "@/components/ui";
import Link from "next/link";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchKpis = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/analytics/kpis/live`, { credentials: "include" });
  return response.json();
};

const fetchSLA = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/analytics/sla`, { credentials: "include" });
  return response.json();
};

const fetchCosts = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/analytics/costs/summary`, { credentials: "include" });
  return response.json();
};

const fetchSignals = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/signals/summary`, { credentials: "include" });
  return response.json();
};

export default function PortfolioPage() {
  const kpisQuery = useQuery(["kpis"], fetchKpis, { refetchInterval: 30000 });
  const slaQuery = useQuery(["sla"], fetchSLA);
  const costsQuery = useQuery(["costs"], fetchCosts);
  const signalsQuery = useQuery(["signals"], fetchSignals);

  return (
    <PageWrapper>
      <PageHeader title="Portfolio" />
      <div className="mt-8">
        {kpisQuery.isLoading ? (
          <LoadingState />
        ) : kpisQuery.isError ? (
          <p>Error fetching KPIs</p>
        ) : (
          <SectionCard title="KPIs">
            {/* Render KPIs */}
          </SectionCard>
        )}
      </div>

      {slaQuery.isLoading ? (
        <LoadingState />
      ) : slaQuery.isError ? (
        <p>Error fetching SLA</p>
      ) : (
        <SectionCard title="SLA">
          {/* Render SLA */}
        </SectionCard>
      )}

      {costsQuery.isLoading ? (
        <LoadingState />
      ) : costsQuery.isError ? (
        <p>Error fetching Costs</p>
      ) : (
        <SectionCard title="Costs">
          {/* Render Costs */}
        </SectionCard>
      )}

      {signalsQuery.isLoading ? (
        <LoadingState />
      ) : signalsQuery.isError ? (
        <p>Error fetching Signals</p>
      ) : (
        <ul className="list-disc pl-4">
          {(signalsQuery.data?.signals || []).map((signal: any) => (
            <li key={signal.id}>
              {signal.type} - {signal.message} at {new Date(signal.timestamp).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-sm italic">Digital Twin updates on every AI signal refresh (30s)</p>
    </PageWrapper>
  );
}