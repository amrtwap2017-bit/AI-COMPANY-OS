// @ts-nocheck
"use client";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchWorkflows = async () => {
  try {
    const response = await fetch(`${BACK}/api/v1/workflows/instances`, { credentials: "include" });
    if (response.ok) return response.json();
    return [];
  } catch (error) {
    console.error(error);
    return null;
  }
};

const fetchWorkOrders = async () => {
  try {
    const response = await fetch(`${BACK}/api/v1/work-orders`, { credentials: "include" });
    if (response.ok) return response.json();
    return [];
  } catch (error) {
    console.error(error);
    return null;
  }
};

const WorkflowInstancesPage = () => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);

  const { data: workflowData, isLoading: isWorkflowLoading, isError: isWorkflowError } = useQuery(
    "workflows",
    fetchWorkflows,
    {
      refetchInterval: 60000,
      onSuccess: (data) => setWorkflows(data),
    }
  );

  const { data: workOrdersData, isLoading: isWorkOrdersLoading, isError: isWorkOrdersError } = useQuery(
    "workOrders",
    fetchWorkOrders,
    {
      refetchInterval: 60000,
      onSuccess: (data) => setWorkOrders(data),
    }
  );

  if (isWorkflowLoading || isWorkOrdersLoading) return <LoadingState />;
  if (isWorkflowError && isWorkOrdersError) return <EmptyState title="No workflow history" />;

  const totalInstances = workflows.length + (workOrders || []).length;
  const runningInstances = (workOrders || []).filter((wo: any) => wo.status === "in_progress").length;
  const completedInstances = workflows.length - runningInstances;
  const failedInstances = 0; // No failure tracking

  return (
    <PageWrapper>
      <PageHeader title="Workflow Execution History" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total Instances", value: totalInstances },
            { label: "Running", value: runningInstances, badgeColor: "bg-green-500" },
            { label: "Completed", value: completedInstances, badgeColor: "bg-blue-500" },
            { label: "Failed", value: failedInstances, badgeColor: "bg-red-500" },
          ]}
        />
      </SectionCard>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map((wf: any) => (
          <SectionCard key={wf.id}>
            <h3>{wf.name}</h3>
            <StatusBadge status={wf.status} />
            <p>Started: {new Date(wf.created_at).toLocaleString()}</p>
            {wf.completed_at && <p>Duration: {new Date(wf.completed_at - wf.created_at).toISOString().slice(14, 19)}</p>}
          </SectionCard>
        ))}
        {(workOrders || []).map((wo: any) => (
          <SectionCard key={wo.id}>
            <h3>{wo.title}</h3>
            <StatusBadge status={wo.status} />
            <p>Started: {new Date(wo.created_at).toLocaleString()}</p>
          </SectionCard>
        ))}
      </div>
    </PageWrapper>
  );
};

export default WorkflowInstancesPage;