"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";;
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import Link from "next/link";

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

const fetchCostSummary = async () => {
  const response = await fetch("/api/v1/ai/analytics/costs/summary", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch cost summary");
  return response.json();
};

const OperationsWorkbenchPage = () => {
  const signalsQuery = useQuery(["signals"], fetchSignals, { refetchInterval: 60000 });
  const kpisQuery = useQuery(["kpis"], fetchKpis, { refetchInterval: 120000 });
  const costSummaryQuery = useQuery(["costSummary"], fetchCostSummary, { refetchInterval: 300000 });

  if (signalsQuery.isLoading || kpisQuery.isLoading || costSummaryQuery.isLoading) return <LoadingState />;

  if (!signalsQuery.data && !kpisQuery.data && !costSummaryQuery.data) return <EmptyState title="All systems operational" description="No signals or data available." />;

  const { totalWOs, openWOs, criticalWOs } = kpisQuery.data;
  const { avgWOCost, totalWOCost } = costSummaryQuery.data;
  const { criticalSignals, highSignals } = signalsQuery.data;

  return (
    <PageWrapper>
      <PageHeader title="Operations Manager Daily Workbench" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricStrip title="Critical Signals" value={criticalSignals} color="red" />
        <MetricStrip title="Open WOs" value={openWOs} color="blue" />
        <MetricStrip title="WO Cost Today EGP" value={totalWOCost} color="green" />
      </div>
      <SectionCard title="AI Signals">
        {signalsQuery.data.signals.map((signal) => (
          <div key={signal.id} className={`border-l-4 ${signal.priority === "critical" ? "border-red-500" : signal.priority === "high" ? "border-yellow-500" : "border-blue-500"} p-2 mb-2`}>
            <h3 className="font-bold">{signal.title}</h3>
            <p>{signal.message}</p>
            <i>{signal.recommendedAction}</i>
            <div className="flex items-center mt-1">
              <StatusBadge category={signal.category} />
              <StatusBadge priority={signal.priority} />
            </div>
          </div>
        ))}
      </SectionCard>
      <MetricStrip title="Cost Summary" value={`Today's operational cost estimate: ${totalWOCost} EGP | Avg per WO: ${avgWOCost} EGP`} color="green" />
      <div className="flex justify-center mt-4">
        <Link href="/operations/work-orders/new" className="btn mr-2">New Work Order</Link>
        <Link href="/operations/dispatch" className="btn mr-2">Dispatch</Link>
        <Link href="/analytics/costs" className="btn">Cost Analysis</Link>
      </div>
    </PageWrapper>
  );
};

export default OperationsWorkbenchPage;