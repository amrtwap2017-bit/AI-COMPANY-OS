// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

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

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchServiceRequests = async () => {
  try {
    const response = await authFetch(`/api/v1/service-requests/`).then(r => r.json());
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    return authFetch(`/api/v1/operations/service-requests`).then((response) => response.json());
  }
};

const ServiceRequestsPage = () => {
  const [priorityFilter, setPriorityFilter] = useState("All");
  const { data, isLoading, isError } = useQuery(
    ["service-requests"],
    fetchServiceRequests,
    {
      refetchInterval: 60000,
    }
  );

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <EmptyState message="No service requests found" />;

  const totalRequests = (data || []).length;
  const openRequests = toArr(data).filter((sr: any) => sr.status === "open").length;
  const inProgressRequests = toArr(data).filter((sr: any) => sr.status === "in_progress").length;
  const convertedToWO = toArr(data).filter((sr: any) => sr.status === "converted").length;

  const filteredRequests = data
    .filter((sr: any) =>
      priorityFilter === "All" || sr.priority === priorityFilter.toLowerCase()
    )
    .sort((a: any, b: any) => {
      if (a.priority === b.priority) return 0;
      if (a.priority === "Critical") return -1;
      if (b.priority === "Critical") return 1;
      return 0;
    });

  const convertToWO = async (srId: string) => {
    await fetch(`${BACK}/api/v1/work-orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_request_id: srId }),
      credentials: "include",
    });
  };

  return (
    <PageWrapper>
      <PageHeader title="Service Requests" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total Requests", value: totalRequests },
            { label: "Open", value: openRequests, color: "green" },
            { label: "In Progress", value: inProgressRequests, color: "blue" },
            { label: "Converted to WO", value: convertedToWO, color: "purple" },
          ]}
        />
      </SectionCard>
      <div className="flex gap-4">
        <button
          onClick={() => setPriorityFilter("All")}
          className={`btn ${
            priorityFilter === "All" ? "btn-active" : ""
          }`}
        >
          All
        </button>
        <button
          onClick={() => setPriorityFilter("Critical")}
          className={`btn ${
            priorityFilter === "Critical" ? "btn-active" : ""
          }`}
        >
          Critical
        </button>
        <button
          onClick={() => setPriorityFilter("High")}
          className={`btn ${priorityFilter === "High" ? "btn-active" : ""}`}
        >
          High
        </button>
        <button
          onClick={() => setPriorityFilter("Medium")}
          className={`btn ${
            priorityFilter === "Medium" ? "btn-active" : ""
          }`}
        >
          Medium
        </button>
        <button
          onClick={() => setPriorityFilter("Low")}
          className={`btn ${priorityFilter === "Low" ? "btn-active" : ""}`}
        >
          Low
        </button>
      </div>
      {filteredRequests.length > 0 ? (
        toArr(filteredRequests).map((sr: any) => (
          <SectionCard key={sr.id}>
            <h3>{sr.title}</h3>
            <StatusBadge status={sr.status} />
            <p className="text-sm">
              Requested by {sr.requester} on {new Date(sr.created_at).toLocaleDateString()}
            </p>
            <p className="truncate">{sr.description}</p>
            {sr.status === "open" && (
              <button
                onClick={() => convertToWO(sr.id)}
                className="btn btn-primary"
              >
                Convert to WO
              </button>
            )}
          </SectionCard>
        ))
      ) : (
        <EmptyState message="No service requests found" />
      )}
    </PageWrapper>
  );
};

export default ServiceRequestsPage;