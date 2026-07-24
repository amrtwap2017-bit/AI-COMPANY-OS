"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";
import Link from "next/link";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchWorkOrders = async () => {
  const response = await fetch(`${BACK}/api/v1/work-orders`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch work orders");
  return response.json();
};

export default function WorkOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "In Progress" | "Completed" | "Cancelled">("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | "Critical" | "High" | "Medium">("All");

  const { data: workOrders, isLoading, isError } = useQuery({
    queryKey: ["work-orders"],
    queryFn: fetchWorkOrders,
    refetchInterval: 60000,
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState title="Failed to load work orders" />;

  const filteredWorkOrders = (workOrders || []).filter((wo: any) => {
    const statusMatch = statusFilter === "All" || wo.status === statusFilter;
    const priorityMatch = priorityFilter === "All" || wo.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const metricData = {
    Total: (workOrders || []).length,
    Open: (workOrders || []).filter((wo: any) => wo.status === "Open").length,
    "In Progress": (workOrders || []).filter((wo: any) => wo.status === "In Progress").length,
    "Critical Open": (workOrders || []).filter((wo: any) => wo.status === "Open" && wo.priority === "Critical").length,
    Completed: (workOrders || []).filter((wo: any) => wo.status === "Completed").length,
  };

  return (
    <PageWrapper>
      <PageHeader title="Work Orders" actions={<Link href="/operations/work-orders/new">New WO</Link>} />
      <MetricStrip data={metricData} />
      <div className="flex gap-4">
        {["All", "Open", "In Progress", "Completed", "Cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-2 rounded-md ${
              statusFilter === status ? "bg-blue-500 text-white" : "border border-gray-300 text-gray-700"
            }`}
          >
            {status}
          </button>
        ))}
      </div>
      <div className="flex gap-4">
        {["All", "Critical", "High", "Medium"].map((priority) => (
          <button
            key={priority}
            onClick={() => setPriorityFilter(priority)}
            className={`px-3 py-2 rounded-md ${
              priorityFilter === priority ? "bg-blue-500 text-white" : "border border-gray-300 text-gray-700"
            }`}
          >
            {priority}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkOrders.sort((a, b) => {
          if (a.priority === "Critical" && b.priority !== "Critical") return -1;
          if (b.priority === "Critical" && a.priority !== "Critical") return 1;
          return new Date(b.created_at) - new Date(a.created_at);
        }).map((wo: any) => (
          <Link key={wo.id} href={`/operations/work-orders/${wo.id}`}>
            <SectionCard>
              <h3 className="font-bold">{wo.title}</h3>
              <div className="flex gap-2">
                <StatusBadge status={wo.status} />
                <span>{wo.type}</span>
                <span>{wo.priority}</span>
              </div>
              <p className={`text-red-500 ${new Date(wo.due_date) < new Date() && wo.status !== "Completed" ? "" : "opacity-50"}`}>
                {wo.due_date}
              </p>
            </SectionCard>
          </Link>
        ))}
      </div>
    </PageWrapper>
  );
}