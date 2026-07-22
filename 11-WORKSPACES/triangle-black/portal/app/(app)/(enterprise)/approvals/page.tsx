"use client"; // @ts-nocheck

import { useQuery, useMutation } from "@tanstack/react-query";
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
import { fetchWithCredentials, toast } from "@/utils";

const APPROVALS_URL = "/api/v1/inventory/purchase-requests";
const APPROVE_URL = "/api/v1/actions/inventory/purchase-requests/";
const ORDERS_URL = "/api/v1/inventory/purchase-orders";

const getPendingPRs = async () => {
  const response = await fetchWithCredentials(APPROVALS_URL, { method: "GET" });
  return response.json();
};

const approvePR = async (prId: string) => {
  const response = await fetchWithCredentials(
    `${APPROVE_URL}${prId}/approve`,
    { method: "POST" }
  );
  if (!response.ok) throw new Error("Failed to approve PR");
  return response.json();
};

const getRecentlyApprovedPRs = async () => {
  const response = await fetchWithCredentials(APPROVALS_URL, { method: "GET" });
  const prs = await response.json();
  return prs.filter((pr: any) => pr.status === "approved").slice(0, 5);
};

const getPurchaseOrders = async () => {
  const response = await fetchWithCredentials(ORDERS_URL, { method: "GET" });
  return response.json();
};

export default function ApprovalsPage() {
  const { data: pendingPRs, isLoading: isPendingLoading } = useQuery(
    ["pendingPRs"],
    getPendingPRs
  );

  const { data: recentlyApprovedPRs, isLoading: isRecentlyApprovedLoading } =
    useQuery(["recentlyApprovedPRs"], getRecentlyApprovedPRs);

  const approveMutation = useMutation(approvePR, {
    onSuccess: () => {
      toast.success("Purchase Request approved successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <PageWrapper>
      <PageHeader title="Approvals" />
      <SectionCard title="Metrics">
        <MetricStrip
          metrics={[
            { label: "Pending PRs", value: pendingPRs?.length || 0, color: "blue" },
            {
              label: "Urgent",
              value: pendingPRs?.filter((pr: any) => pr.urgency === "urgent").length || 0,
              color: "red",
            },
            {
              label: "High Priority",
              value: pendingPRs?.filter((pr: any) => pr.priority === "high").length || 0,
              color: "orange",
            },
            {
              label: "Approved Today",
              value: pendingPRs?.filter(
                (pr: any) =>
                  new Date(pr.approved_at).toDateString() === new Date().toDateString()
              ).length || 0,
              color: "green",
            },
          ]}
        />
      </SectionCard>
      <SectionCard title="Pending Approval Queue">
        {isPendingLoading ? (
          <LoadingState />
        ) : pendingPRs?.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {pendingPRs
              .sort((a: any, b: any) => {
                if (a.urgency !== b.urgency) return a.urgency === "urgent" ? -1 : 1;
                if (a.priority !== b.priority) return a.priority === "high" ? -1 : 1;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
              })
              .map((pr: any) => (
                <div key={pr.id} className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold">{pr.pr_number}</h3>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={pr.urgency} />
                    <StatusBadge status={pr.priority} />
                  </div>
                  <p>{pr.requester}</p>
                  <p>{pr.justification.slice(0, 100)}...</p>
                  <p>Lines: {pr.lines.length}</p>
                  <p>Created: {new Date(pr.created_at).toLocaleDateString()}</p>
                  <div className="flex items-center space-x-2 mt-4">
                    <Button
                      onClick={() => approveMutation.mutate(pr.id)}
                      disabled={approveMutation.isLoading}
                    >
                      Approve
                    </Button>
                    <a href={`/approvals/${pr.id}`}>View Details</a>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <EmptyState message="No pending purchase requests" />
        )}
      </SectionCard>
      <SectionCard title="Recently Approved">
        {isRecentlyApprovedLoading ? (
          <LoadingState />
        ) : recentlyApprovedPRs?.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th>PR Number</th>
                <th>Requester</th>
                <th>Approved By</th>
                <th>Approved Date</th>
              </tr>
            </thead>
            <tbody>
              {recentlyApprovedPRs.map((pr: any) => (
                <tr key={pr.id}>
                  <td>{pr.pr_number}</td>
                  <td>{pr.requester}</td>
                  <td>{pr.approved_by}</td>
                  <td>{new Date(pr.approved_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState message="No recently approved purchase requests" />
        )}
      </SectionCard>
      <SectionCard title="Quick Stats">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3>Draft</h3>
            <p>{pendingPRs?.filter((pr: any) => pr.status === "draft").length || 0}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3>Pending</h3>
            <p>{pendingPRs?.filter((pr: any) => pr.status === "pending").length || 0}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3>Approved</h3>
            <p>{pendingPRs?.filter((pr: any) => pr.status === "approved").length || 0}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3>Rejected</h3>
            <p>{pendingPRs?.filter((pr: any) => pr.status === "rejected").length || 0}</p>
          </div>
        </div>
      </SectionCard>
    </PageWrapper>
  );
}