// @ts-nocheck
"use client";

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
    {
      queryKey: ["audit-logs", entityTypeFilter],
      queryFn: () => fetchAuditLogs("/api/v1/administration/audit").catch(() => fetchAuditLogs("/api/v1/audit-logs")).catch(() => fetchAuditLogs("/api/v1/activities")),
      refetchInterval: 60000,
    }
  );

  if (isLoading) return <LoadingState />;
  if (isError || !auditLogs) return <EmptyState title="Audit logging not configured" note="Enable audit logs." />;

  // Render your component using the fetched data
  return (
    <PageWrapper>
      {/* Your component logic here */}
    </PageWrapper>
  );
};

export default AuditPage;