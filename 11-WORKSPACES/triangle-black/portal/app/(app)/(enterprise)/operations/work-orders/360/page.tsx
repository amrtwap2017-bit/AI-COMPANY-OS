"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
} from "@/components/ui";

const fetchWorkOrders = async () => {
  const response = await fetch("/api/v1/work-orders", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch work orders");
  return response.json();
};

const fetchTechnicians = async () => {
  const response = await fetch("/api/v1/technicians", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch technicians");
  return response.json();
};

const fetchAssets = async () => {
  const response = await fetch("/api/v1/assets", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch assets");
  return response.json();
};

const WorkOrder360Page = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "In Progress" | "Completed">("All");
  const [expandedWOId, setExpandedWOId] = useState<number | null>(null);

  const { data: workOrders, isLoading, isError } = useQuery(["work-orders"], fetchWorkOrders, {
    refetchInterval: 60000,
  });

  const { data: technicians } = useQuery(["technicians"], fetchTechnicians);
  const { data: assets } = useQuery(["assets"], fetchAssets);

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState message="Failed to load work orders" />;

  const filteredWorkOrders = workOrders.filter((wo: any) => {
    if (search && !wo.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "All" && wo.status !== statusFilter) return false;
    return true;
  });

  return (
    <PageWrapper>
      <PageHeader title="Work Order 360" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total WOs", value: workOrders.length },
            { label: "Open", value: workOrders.filter((wo: any) => wo.status === "Open").length },
            { label: "In Progress", value: workOrders.filter((wo: any) => wo.status === "In Progress").length },
            { label: "Completed", value: workOrders.filter((wo: any) => wo.status === "Completed").length },
          ]}
        />
      </SectionCard>
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search WOs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={() => setStatusFilter("All")}
          className={`px-4 py-2 rounded ${statusFilter === "All" ? "bg-blue-500 text-white" : ""}`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter("Open")}
          className={`px-4 py-2 rounded ${statusFilter === "Open" ? "bg-blue-500 text-white" : ""}`}
        >
          Open
        </button>
        <button
          onClick={() => setStatusFilter("In Progress")}
          className={`px-4 py-2 rounded ${statusFilter === "In Progress" ? "bg-blue-500 text-white" : ""}`}
        >
          In Progress
        </button>
        <button
          onClick={() => setStatusFilter("Completed")}
          className={`px-4 py-2 rounded ${statusFilter === "Completed" ? "bg-blue-500 text-white" : ""}`}
        >
          Completed
        </button>
      </div>
      <ul className="mt-4">
        {filteredWorkOrders.map((wo: any) => (
          <li key={wo.id} className="border-b p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <strong>{wo.title}</strong>
              <span className={`badge ${wo.type === "Repair" ? "bg-green-500" : "bg-red-500"}`}>{wo.type}</span>
              <span className={`badge ${wo.priority === "High" ? "bg-red-500" : wo.priority === "Medium" ? "bg-yellow-500" : "bg-green-500"}`}>{wo.priority}</span>
              <StatusBadge status={wo.status} />
            </div>
            <div className="flex items-center gap-2">
              {technicians && technicians.find((t: any) => t.id === wo.technician_id)?.name}
              {assets && assets.find((a: any) => a.id === wo.asset_id)?.name && (
                <span className="badge bg-gray-500">{assets.find((a: any) => a.id === wo.asset_id)?.name}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {new Date(wo.due_date) < new Date() && !wo.completed ? (
                <span className="text-red-500">{wo.due_date}</span>
              ) : (
                <span>{wo.due_date}</span>
              )}
            </div>