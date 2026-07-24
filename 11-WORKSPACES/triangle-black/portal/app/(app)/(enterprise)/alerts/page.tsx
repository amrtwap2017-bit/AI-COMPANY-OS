"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchSignals = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/signals`, { credentials: "include" });
  if (!response.ok) return [];
  return response.json();
};

const fetchNotifications = async () => {
  try {
    const response = await fetch(`${BACK}/api/v1/notifications`, { credentials: "include" });
    if (response.status === 404) return null;
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

const AlertsPage = () => {
  const [priorityFilter, setPriorityFilter] = useState<"All" | "Critical" | "High" | "Medium">("All");

  const { data: signalsData, isLoading: signalsLoading, isError: signalsError } = useQuery({
    queryKey: ["signals"],
    queryFn: fetchSignals,
    refetchInterval: 30000,
  });

  const { data: notificationsData, isLoading: notificationsLoading, isError: notificationsError } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 30000,
  });

  if (signalsLoading || notificationsLoading) return <LoadingState />;
  if (signalsError || notificationsError) return <EmptyState />;

  const signals = signalsData?.data || [];
  const notifications = notificationsData ? notificationsData.data : [];

  const totalAlerts = (signals || []).length + (notifications ? (notifications || []).length : 0);
  const criticalCount = (signals || []).filter(signal => signal.priority === "Critical").length;
  const highCount = (signals || []).filter(signal => signal.priority === "High").length;

  const filteredSignals = signals
    .filter(signal => priorityFilter === "All" || signal.priority === priorityFilter)
    .sort((a: any, b: any) => (b.priority === "Critical" ? -1 : a.priority === "Critical" ? 1 : 0));

  return (
    <PageWrapper>
      <PageHeader title="Operational Alerts">
        <MetricStrip
          metrics={[
            { label: "Total Alerts", value: totalAlerts },
            { label: "Critical", value: criticalCount, color: "red" },
            { label: "High", value: highCount, color: "amber" },
            { label: "Notifications", value: notifications ? (notifications || []).length : 0, color: "blue" },
          ]}
        />
      </PageHeader>
      <div className="flex gap-4">
        <button
          onClick={() => setPriorityFilter("All")}
          className={`btn ${priorityFilter === "All" && "btn-active"}`}
        >
          All
        </button>
        <button
          onClick={() => setPriorityFilter("Critical")}
          className={`btn ${priorityFilter === "Critical" && "btn-active"}`}
        >
          Critical
        </button>
        <button
          onClick={() => setPriorityFilter("High")}
          className={`btn ${priorityFilter === "High" && "btn-active"}`}
        >
          High
        </button>
        <button
          onClick={() => setPriorityFilter("Medium")}
          className={`btn ${priorityFilter === "Medium" && "btn-active"}`}
        >
          Medium
        </button>
      </div>
      {filteredSignals.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredSignals.map(signal => (
            <SectionCard key={signal.signal_id} className={`border-l-4 ${signal.priority === "Critical" ? "border-red-500" : signal.priority === "High" ? "border-amber-500" : "border-blue-500"}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{signal.title}</h3>
                <StatusBadge>{signal.category}</StatusBadge>
              </div>
              <p>{signal.message}</p>
              <p className="italic text-sm">{signal.recommended_action}</p>
              <p>Reference Code: {signal.signal_id}</p>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
      {notifications ? (
        <SectionCard title="System Notifications">
          {(notifications || []).map(notification => (
            <p key={notification.id}>{notification.message}</p>
          ))}
        </SectionCard>
      ) : (
        <EmptyState />
      )}
      {totalAlerts === 0 && (signals || []).length === 0 && notifications ? (
        <SectionCard className="bg-green-500 text-white">
          <h3>All Clear</h3>
          <p>No active alerts or notifications.</p>
        </SectionCard>
      ) : null}
    </PageWrapper>
  );
};

export default AlertsPage;