"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState } from "@/components/ui";

const fetchActiveSignals = async () => {
  const response = await fetch("/api/v1/ai/signals/summary", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch active signals");
  return response.json();
};

const fetchAIHealth = async () => {
  const response = await fetch("/api/v1/ai/health", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch AI health");
  return response.json();
};

const AgentCard = ({ name, purpose, status, lastOutput }: { name: string; purpose: string; status: string; lastOutput: string }) => (
  <SectionCard>
    <h3 className="text-lg font-medium">{name}</h3>
    <p className="text-sm text-muted-foreground">{purpose}</p>
    <div className="flex items-center justify-between">
      <StatusBadge status={status} />
      <p className="text-xs text-muted-foreground">{lastOutput}</p>
    </div>
  </SectionCard>
);

const AgentsPage = () => {
  const { data: activeSignals, isLoading: signalsLoading } = useQuery(["activeSignals"], fetchActiveSignals, { refetchInterval: 60000 });
  const { data: aiHealth, isLoading: healthLoading } = useQuery(["aiHealth"], fetchAIHealth, { refetchInterval: 60000 });

  if (signalsLoading || healthLoading) return <LoadingState />;

  const agents = [
    { name: "Signals Engine", purpose: "Monitors 9 signal types, checks DB every request", status: aiHealth.signalsEngine.status, lastOutput: activeSignals.totalSignals.toString() },
    { name: "Dispatch Agent", purpose: "Scores 25 technicians per WO recommendation", status: aiHealth.dispatchAgent.status, lastOutput: "N/A" },
    { name: "Inventory Agent", purpose: "Maps WO types to parts, checks stock levels", status: aiHealth.inventoryAgent.status, lastOutput: "N/A" },
    { name: "SLA Analytics Agent", purpose: "Computes compliance from work orders", status: aiHealth.slaAnalyticsAgent.status, lastOutput: "N/A" },
    { name: "KPI Agent", purpose: "Aggregates WOs, technicians, inventory, procurement", status: aiHealth.kpiAgent.status, lastOutput: "N/A" },
    { name: "Trends Agent", purpose: "Computes monthly completion rates", status: aiHealth.trendsAgent.status, lastOutput: "N/A" },
    { name: "Auto-PR Agent", purpose: "Creates purchase requests from work orders", status: aiHealth.autoPRAgent.status, lastOutput: "N/A" },
    { name: "Health Monitor", purpose: "Checks DB + signals engine status", status: aiHealth.healthMonitor.status, lastOutput: "N/A" },
    { name: "Predictive Maintenance", purpose: "Detects assets needing PM from WO history", status: aiHealth.predictiveMaintenance.status, lastOutput: "N/A" },
  ];

  return (
    <PageWrapper>
      <PageHeader title="AI Agents Overview" description="What AI agents power this platform" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricStrip title="Active Agents" value={9} />
        <MetricStrip title="Signals Generated" value={activeSignals.totalSignals} />
        <MetricStrip title="Health Status" value={aiHealth.overallStatus} />
      </div>
      <h2 className="mt-8 text-xl font-medium">Agent Registry</h2>
      {agents.map((agent) => (
        <AgentCard key={agent.name} {...agent} />
      ))}
      <p className="text-xs mt-4 text-muted-foreground">Powered by Ollama qwen2.5-coder:7b via Hub OS</p>
    </PageWrapper>
  );
};

export default AgentsPage;