"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";

const fetchAuditLogs = async (endpoint: string) => {
  const response = await fetch(endpoint, { credentials: "include" });
  if (!response.ok && response.status === 404) throw new Error("Not Found");
  return response.json();
};

const AuditPage = () => {
  const [entityTypeFilter, setEntityTypeFilter] = useState<"All" | "work_order" | "asset" | "contract" | "purchase_order" | "user">("All");

  const { data: auditLogs, isLoading, isError } = useQuery(
    ["audit-logs", entityTypeFilter],
    () => fetchAuditLogs("/api/v1/administration/audit").catch(() => fetchAuditLogs("/api/v1/audit-logs")).catch(() => fetchAuditLogs("/api/v1/activity")),
    { refetchInterval: 60000 }
  );

  if (isLoading) return <LoadingState />;
  if (isError || !auditLogs) return <EmptyState title="Audit logging not configured" note="Enable audit logging in administration settings" />;

  const totalEvents = auditLogs.length;
  const todayEvents = auditLogs.filter(log => new Date(log.created_at).toDateString() === new Date().toDateString()).length;
  const thisWeekEvents = auditLogs.filter(log => new Date(log.created_at).getWeekNumber() === new Date().getWeekNumber()).length;
  const uniqueUsers = new Set(auditLogs.map(log => log.user_id)).size;

  return (
    <PageWrapper>
      <PageHeader title="Audit Log" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total Events", value: totalEvents },
            { label: "Today", value: todayEvents },
            { label: "This Week", value: thisWeekEvents },
            { label: "Unique Users", value: uniqueUsers }
          ]}
        />
      </SectionCard>
      <div className="flex items-center mb-4">
        <button
          onClick={() => setEntityTypeFilter("All")}
          className={`px-2 py-1 mr-2 ${entityTypeFilter === "All" ? "bg-blue-500 text-white" : "border border-gray-300 text-gray-700"}`}
        >
          All
        </button>
        <button
          onClick={() => setEntityTypeFilter("work_order")}
          className={`px-2 py-1 mr-2 ${entityTypeFilter === "work_order" ? "bg-blue-500 text-white" : "border border-gray-300 text-gray-700"}`}
        >
          Work Order
        </button>
        <button
          onClick={() => setEntityTypeFilter("asset")}
          className={`px-2 py-1 mr-2 ${entityTypeFilter === "asset" ? "bg-blue-500 text-white" : "border border-gray-300 text-gray-700"}`}
        >
          Asset
        </button>
        <button
          onClick={() => setEntityTypeFilter("contract")}
          className={`px-2 py-1 mr-2 ${entityTypeFilter === "contract" ? "bg-blue-500 text-white" : "border border-gray-300 text-gray-700"}`}
        >
          Contract
        </button>
        <button
          onClick={() => setEntityTypeFilter("purchase_order")}
          className={`px-2 py-1 mr-2 ${entityTypeFilter === "purchase_order" ? "bg-blue-500 text-white" : "border border-gray-300 text-gray-700"}`}
        >
          Purchase Order
        </button>
        <button
          onClick={() => setEntityTypeFilter("user")}
          className={`px-2 py-1 ${entityTypeFilter === "user" ? "bg-blue-500 text-white" : "border border-gray-300 text-gray-700"}`}
        >
          User
        </button>
      </div>
      <table className="w-full">
        <thead>
          <tr>
            <th>User Name</th>
            <th>Action</th>
            <th>Entity Type</th>
            <th>Entity ID</th>
            <th>Created At</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {auditLogs
            .filter(log => entityTypeFilter === "All" || log.entity_type === entityTypeFilter)
            .map((log, index) => (
              <tr key={index}>
                <td><strong>{log.user_name}</strong></td>
                <td><StatusBadge status={log.action} /></td>
                <td><StatusBadge status={log.entity_type} /></td>
                <td>{log.entity_id.slice(0, 10)}...</td>
                <td>{new Date(log.created_at).toLocaleString()}</td>
                <td>{log.details ? log.details.slice(0, 60) + (log.details.length > 60 ? "..." : "") : "-"}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </PageWrapper>
  );
};

export default AuditPage;