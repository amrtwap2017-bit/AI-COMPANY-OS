"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import Link from "next/link";

const fetchSignals = async () => {
  const response = await fetch("/api/v1/ai/signals", { credentials: "include" });
  return response.json();
};

const fetchPRs = async () => {
  const response = await fetch("/api/v1/inventory/purchase-requests/", { credentials: "include" });
  return response.json();
};

const fetchWOs = async () => {
  const response = await fetch("/api/v1/work-orders", { credentials: "include" });
  return response.json();
};

const CenterPage = () => {
  const [tab, setTab] = useState("All");

  const signalsQuery = useQuery(["signals"], fetchSignals, { refetchInterval: 30000 });
  const prsQuery = useQuery(["prs"], fetchPRs, { refetchInterval: 30000 });
  const wosQuery = useQuery(["wos"], fetchWOs, { refetchInterval: 30000 });

  if (signalsQuery.isLoading || prsQuery.isLoading || wosQuery.isLoading) return <LoadingState />;

  if (signalsQuery.isError || prsQuery.isError || wosQuery.isError) return <EmptyState title="Failed to load actions" description="Please try again later." />;

  const signals = signalsQuery.data;
  const prs = prsQuery.data;
  const wos = wosQuery.data;

  const allActions = [
    ...signals.filter(signal => signal.status !== "completed"),
    ...prs.filter(pr => pr.status === "pending"),
    ...wos.filter(wo => wo.status === "critical")
  ].sort((a, b) => {
    if (a.priority > b.priority) return -1;
    if (a.priority < b.priority) return 1;
    return 0;
  });

  const totalActions = allActions.length;
  const criticalActions = signals.filter(signal => signal.status !== "completed").length + wos.filter(wo => wo.status === "critical").length;
  const approvalsPending = prs.filter(pr => pr.status === "pending").length;

  return (
    <PageWrapper>
      <PageHeader title="Unified Action Center" />
      <MetricStrip
        metrics={[
          { label: "Total Actions", value: totalActions },
          { label: "Critical Actions", value: criticalActions, color: "red" },
          { label: "Approvals Pending", value: approvalsPending, color: "amber" },
          { label: "Completed Today", value: 0 }
        ]}
      />
      <div className="flex gap-4">
        <button
          onClick={() => setTab("All")}
          className={`px-4 py-2 rounded bg-white border ${tab === "All" ? "border-blue-500 text-blue-500" : "text-gray-600"}`}
        >
          All
        </button>
        <button
          onClick={() => setTab("Signals")}
          className={`px-4 py-2 rounded bg-white border ${tab === "Signals" ? "border-red-500 text-red-500" : "text-gray-600"}`}
        >
          Signals
        </button>
        <button
          onClick={() => setTab("Approvals")}
          className={`px-4 py-2 rounded bg-white border ${tab === "Approvals" ? "border-amber-500 text-amber-500" : "text-gray-600"}`}
        >
          Approvals
        </button>
        <button
          onClick={() => setTab("Work Orders")}
          className={`px-4 py-2 rounded bg-white border ${tab === "Work Orders" ? "border-red-500 text-red-500" : "text-gray-600"}`}
        >
          Work Orders
        </button>
      </div>
      {allActions.length === 0 && <EmptyState title="All Clear" description="No actions pending." />}
      <ul className="mt-4">
        {allActions.map(action => (
          <li key={action.id} className={`border p-4 rounded mb-2 ${action.type === "signal" ? (action.status !== "completed" ? "border-red-500" : "border-blue-500") : action.type === "pr" ? "border-amber-500" : "border-red-500"}`}>
            {action.type === "signal" && (
              <>
                <h3 className="text-lg font-bold">{action.title}</h3>
                <p>{action.recommended_action}</p>
                <Link href={`/signals/${action.id}`} className="mt-2 text-blue-500 hover:underline">View Signal</Link>
              </>
            )}
            {action.type === "pr" && (
              <>
                <h3 className="text-lg font-bold">{action.pr_number}</h3>
                <p>Requested by {action.requester}</p>
                <Link href={`/approvals/${action.id}`} className="mt-2 text-blue-500 hover:underline">Approve PR</Link>
              </>
            )}
            {action.type === "wo" && (
              <>
                <h3 className="text-lg font-bold">{action.title}</h3>
                <Link href={`/operations/work-orders/${action.id}`}