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
  Button,
} from "@/components/ui";
import { useState } from "react";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchPurchaseRequests = async () => {
  const response = await fetch(`${BACK}/api/v1/purchase-requests/`, {
    credentials: "include",
  });
  return response.json();
};

const fetchWorkOrders = async () => {
  const response = await fetch(`${BACK}/api/v1/work-orders?status=completed`, {
    credentials: "include",
  });
  return response.json();
};

const ApprovalsPage = () => {
  const [loading, setLoading] = useState(false);

  const { data: prsData, isLoading: prsLoading } = useQuery(
    ["purchase-requests"],
    fetchPurchaseRequests,
    {
      refetchInterval: 60000,
    }
  );

  const { data: wosData, isLoading: wosLoading } = useQuery(
    ["work-orders"],
    fetchWorkOrders,
    {
      refetchInterval: 60000,
    }
  );

  if (prsLoading || wosLoading) return <LoadingState />;

  if (!prsData.length && !wosData.length) return <EmptyState message="Approval queue is clear" />;

  const pendingApprovals = prsData.filter(pr => pr.status === "draft" || pr.status === "pending");
  const completedWOs = wosData.filter(wo => wo.status === "completed");

  return (
    <PageWrapper>
      <PageHeader title="Workflow Approval Queue" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Metric Strip">
          <MetricStrip
            label="Pending Approvals"
            value={pendingApprovals.length}
            badge={<StatusBadge status="pending" />}
          />
          <MetricStrip
            label="Completed WOs"
            value={completedWOs.length}
            badge={<StatusBadge status="completed" />}
          />
          <MetricStrip
            label="Total Queue"
            value={prsData.length + wosData.length}
          />
        </SectionCard>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Purchase Requests">
          {pendingApprovals.map(pr => (
            <div key={pr.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
              <div>
                <p>{pr.pr_number}</p>
                <p>{pr.requester}</p>
                <StatusBadge status={pr.status} />
              </div>
              <Button
                onClick={() => {
                  setLoading(true);
                  fetch(`${BACK}/api/v1/actions/inventory/purchase-requests/${pr.id}/approve`, {
                    method: "POST",
                    credentials: "include",
                  }).then(() => {
                    setLoading(false);
                  });
                }}
                disabled={loading}
              >
                Approve
              </Button>
            </div>
          ))}
        </SectionCard>
        <SectionCard title="Completed Work Orders">
          {completedWOs.map(wo => (
            <div key={wo.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
              <div>
                <p>{wo.title}</p>
                <p>{wo.technician}</p>
                <p>{new Date(wo.completed_at).toLocaleString()}</p>
              </div>
              <Button disabled>Sign Off</Button>
            </div>
          ))}
        </SectionCard>
      </div>
    </PageWrapper>
  );
};

export default ApprovalsPage;