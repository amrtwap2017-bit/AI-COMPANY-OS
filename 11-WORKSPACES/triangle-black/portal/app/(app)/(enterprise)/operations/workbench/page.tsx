"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import Link from "next/link";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchSignals = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/signals`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch signals");
  return response.json();
};

const fetchKpis = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/analytics/kpis/live`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch KPIs");
  return response.json();
};

const fetchCostSummary = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/analytics/costs/summary`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch cost summary");
  return response.json();
};

const DashboardPage = () => {
  const { data: signals, isLoading: signalsLoading, isError: signalsError } = useQuery(["signals"], fetchSignals);
  const { data: kpis, isLoading: kpisLoading, isError: kpisError } = useQuery(["kpis"], fetchKpis);
  const { data: costSummary, isLoading: costSummaryLoading, isError: costSummaryError } = useQuery(["costSummary"], fetchCostSummary);

  if (signalsLoading || kpisLoading || costSummaryLoading) return <LoadingState />;
  if (signalsError || kpisError || costSummaryError) return <EmptyState />;

  const totalWOCost = costSummary?.totalWOCost ?? 0;
  const avgWOCost = costSummary?.avgWOCost ?? 0;

  return (
    <PageWrapper>
      <PageHeader title="Dashboard" />
      <SectionCard title="Signals">
        {signals.map((signal: any) => (
          <div key={signal.id} className="flex items-center mt-1">
            <StatusBadge category={signal.category} />
            <StatusBadge priority={signal.priority} />
          </div>
        ))}
      </SectionCard>
      <MetricStrip title="Cost Summary" value={`Today's operational cost estimate: ${totalWOCost} EGP | Avg per WO: ${avgWOCost} EGP`} color="green" />
      <div className="flex justify-center mt-4">
        <Link href="/operations/work-orders/new" className="btn mr-2">New Work Order</Link>
        <Link href="/operations/dispatch" className="btn mr-2">Dispatch</Link>
      </div>
    </PageWrapper>
  );
};

export default DashboardPage;