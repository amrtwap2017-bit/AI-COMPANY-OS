"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
} from "@/components/ui";
import { useState } from "react";

const fetchWorkflows = async () => {
  const response = await fetch("/api/v1/workflows", { credentials: "include" });
  if (!response.ok) {
    throw new Error("Not Found");
  }
  return response.json();
};

const fetchSignals = async () => {
  const response = await fetch("/api/v1/ai/signals", { credentials: "include" });
  return response.json();
};

export default function WorkflowsPage() {
  const [runningWorkflows, setRunningWorkflows] = useState<string[]>([]);

  const { data: workflowsData, isLoading: workflowsLoading, isError: workflowsError } = useQuery(
    ["workflows"],
    fetchWorkflows,
    {
      refetchInterval: 120000,
    }
  );

  const { data: signalsData, isLoading: signalsLoading } = useQuery(
    ["signals"],
    fetchSignals,
    {
      refetchInterval: 30000,
    }
  );

  if (workflowsError) return <EmptyState title="Workflow engine not configured" link="/operations/workbench" />;

  const totalWorkflows = workflowsData ? workflowsData.length : 0;
  const activeWorkflows = workflowsData ? workflowsData.filter(w => w.status === "active").length : 0;
  const failedWorkflows = workflowsData ? workflowsData.filter(w => w.status === "failed").length : 0;
  const triggeredToday = workflowsData
    ? workflowsData.filter(w => new Date(w.last_run).toDateString() === new Date().toDateString()).length
    : 0;

  return (
    <PageWrapper>
      <PageHeader title="Workflow Management" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total Workflows", value: totalWorkflows },
            { label: "Active", value: activeWorkflows, color: "green" },
            { label: "Failed", value: failedWorkflows, color: "red" },
            { label: "Triggered Today", value: triggeredToday },
          ]}
        />
      </SectionCard>
      <SectionCard title="Workflow List">
        {workflowsLoading ? (
          <LoadingState />
        ) : workflowsData && workflowsData.length === 0 ? (
          <EmptyState title="No workflows found" />
        ) : (
          workflowsData.map(workflow => (
            <div key={workflow.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
              <div>
                <strong>{workflow.name}</strong>
                <StatusBadge status={workflow.status} />
              </div>
              <div>
                <span className={`badge ${workflow.trigger_type === "manual" ? "bg-green-500" : workflow.trigger_type === "scheduled" ? "bg-blue-500" : "bg-yellow-500"} text-white`}>{workflow.trigger_type}</span>
                <span className="ml-2">{new Date(workflow.last_run).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => {
                  setRunningWorkflows(prev => [...prev, workflow.id]);
                  fetch(`/api/v1/workflows/${workflow.id}/run`, { method: "POST", credentials: "include" })
                    .then(() => {
                      setTimeout(() => {
                        setRunningWorkflows(prev => prev.filter(id => id !== workflow.id));
                      }, 2000);
                    });
                }}
                disabled={runningWorkflows.includes(workflow.id)}
                className={`btn ${runningWorkflows.includes(workflow.id) ? "btn-disabled" : ""}`}
              >
                {runningWorkflows.includes(workflow.id) ? "Running..." : "Run Now"}
              </button>
            </div>
          ))
        )}
      </SectionCard>
      <SectionCard title="Recent AI Signals">
        {signalsLoading ? (
          <LoadingState />
        ) : signalsData && signalsData.length > 0 ? (
          <ul className="list-disc pl-4">
            {signalsData.slice(0, 3).map(signal => (
              <li key={signal.id}>{signal.title}</li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No AI signals found" />
        )}
      </SectionCard>
    </PageWrapper>
  );
}