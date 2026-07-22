"use client"; // @ts-nocheck

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState, Button
} from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchPRs() {
  const r = await fetch(`${BACK}/api/v1/inventory/purchase-requests/`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? d.data ?? [];
}

async function fetchPOs() {
  const r = await fetch(`${BACK}/api/v1/inventory/purchase-orders/`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? d.data ?? [];
}

export default function ApprovalsPage() {
  const [approving, setApproving] = useState({});
  const [messages, setMessages] = useState({});

  const { data: prs = [], isLoading: prsLoading, refetch } = useQuery({
    queryKey: ["approvals-prs"],
    queryFn: fetchPRs,
    refetchInterval: 60000,
  });
  const { data: pos = [], isLoading: posLoading } = useQuery({
    queryKey: ["approvals-pos"],
    queryFn: fetchPOs,
    refetchInterval: 60000,
  });

  const isLoading = prsLoading || posLoading;

  const pending  = prs.filter((p) => p.status === "draft" || p.status === "pending");
  const urgent   = pending.filter((p) => p.urgency === "urgent");
  const approved = prs.filter((p) => p.status === "approved").slice(0, 5);

  const sorted = [...pending].sort((a, b) => {
    if (a.urgency === "urgent" && b.urgency !== "urgent") return -1;
    if (b.urgency === "urgent" && a.urgency !== "urgent") return 1;
    if (a.priority === "high" && b.priority !== "high") return -1;
    if (b.priority === "high" && a.priority !== "high") return 1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  async function handleApprove(prId) {
    setApproving((prev) => ({ ...prev, [prId]: true }));
    try {
      const r = await fetch(
        `${BACK}/api/v1/actions/inventory/purchase-requests/${prId}/approve`,
        { method: "POST", credentials: "include" }
      );
      if (r.ok) {
        setMessages((prev) => ({ ...prev, [prId]: "Approved" }));
        refetch();
      } else {
        setMessages((prev) => ({ ...prev, [prId]: `Error ${r.status}` }));
      }
    } catch (e) {
      setMessages((prev) => ({ ...prev, [prId]: "Network error" }));
    } finally {
      setApproving((prev) => ({ ...prev, [prId]: false }));
    }
  }

  if (isLoading) return <LoadingState message="Loading approval queue..." />;

  return (
    <PageWrapper>
      <PageHeader
        title="Approvals Center"
        subtitle="Purchase request approval queue"
        badge={pending.length > 0 ? `${pending.length} Pending` : undefined}
      />

      <MetricStrip metrics={[
        { label: "Pending Approval", value: pending.length, color: "amber" as const },
        { label: "Urgent",           value: urgent.length,  color: urgent.length > 0 ? "red" as const : "slate" as const },
        { label: "Approved Total",   value: prs.filter((p) => p.status === "approved").length, color: "green" as const },
        { label: "Total PRs",        value: prs.length },
      ]} />

      <SectionCard title="Pending Approval Queue">
        {sorted.length === 0 ? (
          <EmptyState
            title="Queue is clear"
            description="No purchase requests waiting for approval"
          />
        ) : (
          <div className="space-y-3">
            {sorted.map((pr) => (
              <div
                key={pr.id}
                className={`px-4 py-4 rounded-lg border ${
                  pr.urgency === "urgent"
                    ? "border-red-200 bg-red-50"
                    : pr.priority === "high"
                    ? "border-amber-200 bg-amber-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-800">
                        {pr.pr_number || `PR-${pr.id?.slice(0, 8)}`}
                      </span>
                      <StatusBadge status={pr.urgency || "normal"} />
                      <StatusBadge status={pr.priority || "medium"} />
                    </div>
                    <p className="text-xs text-slate-600">
                      {pr.requester} · {pr.department || "Engineering"}
                    </p>
                    {pr.justification && (
                      <p className="text-xs text-slate-500 mt-1 italic">
                        {pr.justification.slice(0, 120)}
                        {pr.justification.length > 120 ? "..." : ""}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {Array.isArray(pr.lines) ? pr.lines.length : 0} line items ·
                      Created {new Date(pr.created_at).toLocaleDateString()}
                    </p>
                    {messages[pr.id] && (
                      <p className={`text-xs font-semibold mt-1 ${
                        messages[pr.id] === "Approved" ? "text-green-600" : "text-red-600"
                      }`}>
                        {messages[pr.id]}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleApprove(pr.id)}
                    disabled={!!approving[pr.id] || messages[pr.id] === "Approved"}
                    variant="primary"
                  >
                    {approving[pr.id] ? "..." : messages[pr.id] === "Approved" ? "✓" : "Approve"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Recently Approved">
        {approved.length === 0 ? (
          <EmptyState title="None yet" description="No approved requests this session" />
        ) : (
          <div className="space-y-2">
            {approved.map((pr) => (
              <div key={pr.id} className="flex items-center justify-between px-4 py-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {pr.pr_number || `PR-${pr.id?.slice(0, 8)}`}
                  </p>
                  <p className="text-xs text-slate-500">{pr.requester} · {pr.approved_by || "System"}</p>
                </div>
                <StatusBadge status="approved" />
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </PageWrapper>
  );
}
