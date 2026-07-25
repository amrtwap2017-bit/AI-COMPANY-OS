// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState } from "@/components/ui";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchAIHealth = async () => {
  const res = await authFetch(`/api/v1/ai/health`);
  return res.json();
};

const fetchSignalsSummary = async () => {
  const res = await authFetch(`/api/v1/ai/signals/summary`);
  return res.json();
};

const fetchCostsSummary = async () => {
  const res = await authFetch(`/api/v1/ai/analytics/costs/summary`);
  return res.json();
};

const AgentsPage = () => {
  const { data: aiHealth, isLoading: isAIHealthLoading } = useQuery(["aiHealth"], fetchAIHealth, { refetchInterval: 60000 });
  const { data: signalsSummary, isLoading: isSignalsSummaryLoading } = useQuery(["signalsSummary"], fetchSignalsSummary, { refetchInterval: 60000 });
  const { data: costsSummary, isLoading: isCostsSummaryLoading } = useQuery(["costsSummary"], fetchCostsSummary, { refetchInterval: 60000 });

  if (isAIHealthLoading || isSignalsSummaryLoading || isCostsSummaryLoading) return <LoadingState />;

  const totalAgents = 11;
  const activeSignalsGenerated = signalsSummary.total;
  const costEngineStatus = costsSummary.status;
  const documentEngineStatus = "OK";

  return (
    <PageWrapper>
      <PageHeader title="AI Agents Registry" />
      <div className="grid grid-cols-3 gap-4">
        <MetricStrip label="Total Agents" value={totalAgents} />
        <MetricStrip label="Active Signals Generated" value={activeSignalsGenerated} />
        <MetricStrip label="Cost Engine Status" value={costEngineStatus} statusBadge={<StatusBadge type="success" />} />
        <MetricStrip label="Document Engine Status" value={documentEngineStatus} statusBadge={<StatusBadge type="success" />} />
      </div>
      <SectionCard title="Agent Registry">
        {Array.from({ length: totalAgents }, (_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border-b last:border-b-0">
            <span>Agent Name</span>
            <StatusBadge type="success" />
            <span>Last Output Description</span>
          </div>
        ))}
      </SectionCard>
    </PageWrapper>
  );
};

export default AgentsPage;