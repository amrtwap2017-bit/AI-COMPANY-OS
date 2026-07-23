"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
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

const WorkflowPage = () => {
  const { data: signals, isLoading: signalsLoading, isError: signalsError } = useQuery(["signals"], fetchSignals, { refetchInterval: 30000 });
  const { data: kpis, isLoading: kpisLoading, isError: kpisError } = useQuery(["kpis"], fetchKpis, { refetchInterval: 120000 });

  if (signalsLoading || kpisLoading) return <LoadingState />;
  if (signalsError || kpisError) return <EmptyState />;

  const activeWorkflows = signals.length;
  const autoPRsCreated = 5; // Example value
  const dispatchesMade = 3; // Example value
  const signalsProcessed = signals.length;

  return (
    <PageWrapper>
      <PageHeader title="Workflow Automation Status" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Active Workflows", value: activeWorkflows },
            { label: "Auto-PRs Created", value: autoPRsCreated },
            { label: "Dispatches Made", value: dispatchesMade },
            { label: "Signals Processed", value: signalsProcessed },
          ]}
        />
      </SectionCard>
      <SectionCard title="Active Automated Workflows">
        {signals.map((signal) => (
          <div key={signal.signal_id} className="flex items-center space-x-4 p-2 border-b last:border-b-0">
            <span>{signal.title}</span>
            <StatusBadge status="TRIGGERED" />
            <span className="text-sm">{signal.category}</span>
            <span className="text-sm">{signal.priority}</span>
          </div>
        ))}
      </SectionCard>
      <SectionCard title="Automation Rules">
        <ul>
          <li>RULE-01: Critical WO → Signal + Dispatch Recommendation</li>
          <li>RULE-02: Stock Below Min → Signal + Auto-PR Suggestion</li>
          <li>RULE-03: Tech at 85%+ → Signal + Rebalance Alert</li>
          <li>RULE-04: PM Plan Overdue → Signal + Schedule Alert</li>
          <li>RULE-05: Assets Fault → Signal + Emergency WO Alert</li>
          <li>RULE-06: Contracts Expiring → Signal + Renewal Pipeline</li>
        </ul>
      </SectionCard>
      <SectionCard title="Links">
        <Link href="/workflow-designer" className="block p-2 border-b">Workflow Designer</Link>
        <Link href="/instances" className="block p-2 border-b">Instances</Link>
        <Link href="/approvals" className="block p-2">Approvals</Link>
      </SectionCard>
    </PageWrapper>
  );
};

export default WorkflowPage;