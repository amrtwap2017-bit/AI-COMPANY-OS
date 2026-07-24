"use client"; // @ts-nocheck

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
  Progress,
  Button
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

const fetchAISignalsSummary = async () => {
  const response = await fetch("/api/v1/ai/signals/summary", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch AI signals summary");
  return response.json();
};

const MyDayPage = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [aiSignalsSummary, setAISignalsSummary] = useState(null);

  const { isLoading: ordersLoading, isError: ordersError } = useQuery(
    "work-orders",
    fetchWorkOrders,
    {
      onSuccess: (data) => setWorkOrders(data),
      refetchInterval: 30000
    }
  );

  const { isLoading: techsLoading, isError: techsError } = useQuery(
    "technicians",
    fetchTechnicians,
    {
      onSuccess: (data) => setTechnicians(data.filter(t => t.is_active)),
      refetchInterval: 30000
    }
  );

  const { isLoading: aiSignalsLoading, isError: aiSignalsError } = useQuery(
    "ai-signals-summary",
    fetchAISignalsSummary,
    {
      onSuccess: (data) => setAISignalsSummary(data),
      refetchInterval: 30000
    }
  );

  const today = new Date().toISOString().split('T')[0];

  const openWOsCount = workOrders.filter(w => w.status === "open").length;
  const inProgressCount = workOrders.filter(w => w.status === "in_progress").length;
  const completedTodayCount = workOrders.filter(w => w.status === "completed" && new Date(w.completed_at).toDateString() === today).length;
  const dueTodayCount = workOrders.filter(w => w.due_date === today).length;

  const priorityWorkOrders = workOrders
    .filter(w => w.status !== "completed" && (w.priority === "critical" || w.priority === "high" || w.due_date === today))
    .sort((a, b) => {
      if (a.priority === "critical" && b.priority !== "critical") return -1;
      if (b.priority === "critical" && a.priority !== "critical") return 1;
      if (a.priority === "high" && b.priority !== "high") return -1;
      if (b.priority === "high" && a.priority !== "high") return 1;
      return new Date(a.due_date) - new Date(b.due_date);
    });

  const technicianCapacity = technicians.map(t => ({
    ...t,
    capacity: t.current_work_orders / t.max_work_orders * 100
  })).sort((a, b) => b.capacity - a.capacity);

  return (
    <PageWrapper>
      <PageHeader title="My Work Orders for Today" />

      {ordersLoading || techsLoading || aiSignalsLoading ? (
        <LoadingState />
      ) : ordersError || techsError || aiSignalsError ? (
        <EmptyState message="Failed to load data" />
      ) : (
        <>
          <SectionCard title="Today's Snapshot">
            <MetricStrip
              metrics={[
                { label: "My Open WOs", value: openWOsCount, color: "bg-green-500" },
                { label: "In Progress", value: inProgressCount, color: "bg-yellow-500" },
                { label: "Completed Today", value: completedTodayCount, color: "bg-blue-500" },
                { label: "Due Today", value: dueTodayCount, color: "bg-red-500" }
              ]}
            />
          </SectionCard>

          <SectionCard title="Today's Priority Work Orders">
            {priorityWorkOrders.length === 0 ? (
              <EmptyState message="No priority work orders today" />
            ) : (
              priorityWorkOrders.map(w => (
                <div key={w.id} className="flex items-center p-4 border-b border-gray-200 min-h-60">
                  <span
                    className={`border-r-4 mr-4 ${
                      w.priority === "critical" ? "border-red-500" : w.priority === "high" ? "border-yellow-500" : "border-blue-500"
                    }`}
                  />
                  <div>
                    <h3 className="font-bold">{w.title}</h3>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                      {w.type}
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                      {w.priority}
                    </span>
                  </div>
                  <div className="flex-grow" />
                  <span>{w.due_date === today ? "Due today" : new Date(w.due_date).toLocaleDateString()}</span>
                  <StatusBadge status={w.status} />
                  {w.status === "open" && (
                    <Button
                      onClick={() => {
                        fetch(`/api/v1/work-orders/${w.id}/status-update`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json", credentials: "include" },
                          body: JSON.stringify({ status: "in_progress" })
                        });
                      }}
                    >
                      Start
                    </Button>
                  )}
                  <a href={`/operations/work-orders/${w.id}`} className="ml-2">View Details</a>
                </div>
              ))
            )}
          </SectionCard>

          <SectionCard title="Technician Capacity Overview">
            {technicianCapacity.length === 0 ? (
              <EmptyState message="No active technicians" />
            ) : (
              technicianCapacity.map(t => (
                <div key={t.id} className="flex items-center p-4 border-b border-gray-200 min-h-60">
                  <div>
                    <h3>{t.name}</h3>
                    <Progress value={t.capacity} color={t.capacity < 50 ? "green" : t.capacity < 85 ? "amber" : "red"} />
                    {t.specializations.slice(0, 2).map(s => (
                      <span key={s} className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </SectionCard>

          {aiSignalsSummary && aiSignalsSummary.critical > 0 && (
            <SectionCard title="AI Dispatch Availability">
              <p className="text-red-500">Critical signals need attention</p>
              <a href="/operations/workbench" className="mt-2 block text-blue-500 hover:underline">View Operations Workbench →</a>
            </SectionCard>
          )}
        </>
      )}
    </PageWrapper>
  );
};

export default MyDayPage;