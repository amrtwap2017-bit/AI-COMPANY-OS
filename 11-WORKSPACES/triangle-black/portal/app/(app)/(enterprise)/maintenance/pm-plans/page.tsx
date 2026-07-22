"use client"; // @ts-nocheck
// @ts-nocheck

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
} from "@/components/ui";
import { useState } from "react";

const fetchPmPlans = async () => {
  const response = await fetch("/api/v1/maintenance/pm-plans", {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch PM plans");
  return response.json();
};

const fetchAssets = async () => {
  const response = await fetch("/api/v1/assets", {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch assets");
  return response.json();
};

const PmPlansPage = () => {
  const [planTypeFilter, setPlanTypeFilter] = useState<"all" | "preventive" | "inspection" | "corrective">("all");

  const { data: pmPlansData, isLoading: isPmPlansLoading } = useQuery(["pm-plans"], fetchPmPlans, {
    refetchInterval: 120000,
  });

  const { data: assetsData, isLoading: isAssetsLoading } = useQuery(["assets"], fetchAssets, {
    refetchInterval: 120000,
  });

  if (isPmPlansLoading || isAssetsLoading) return <LoadingState />;

  if (!pmPlansData || !assetsData) return <EmptyState />;

  const today = new Date().toISOString().slice(0, 10);

  const totalPlans = pmPlansData.length;
  const activePlans = pmPlansData.filter((plan) => plan.status === "active").length;
  const overduePlans = pmPlansData.filter((plan) => plan.next_due_date < today).length;
  const dueThisWeek = pmPlansData.filter((plan) => {
    const nextDueDate = new Date(plan.next_due_date);
    return nextDueDate >= new Date(today) && nextDueDate <= new Date(today + "T6:00:00Z");
  }).length;

  const preventiveCount = pmPlansData.filter((plan) => plan.plan_type === "preventive").length;
  const inspectionCount = pmPlansData.filter((plan) => plan.plan_type === "inspection").length;
  const correctiveCount = pmPlansData.filter((plan) => plan.plan_type === "corrective").length;

  const filteredPmPlans = pmPlansData.filter((plan) => {
    if (planTypeFilter === "all") return true;
    if (planTypeFilter === "preventive" && plan.plan_type !== "preventive") return false;
    if (planTypeFilter === "inspection" && plan.plan_type !== "inspection") return false;
    if (planTypeFilter === "corrective" && plan.plan_type !== "corrective") return false;
    return true;
  });

  const renderPmPlanCard = (plan: any) => {
    const nextDueDate = new Date(plan.next_due_date);
    const daysUntilDue = Math.ceil((nextDueDate - new Date()) / (1000 * 60 * 60 * 24));
    const statusText = daysUntilDue > 0 ? `Due in ${daysUntilDue} days` : `${Math.abs(daysUntilDue)} days overdue`;
    const statusColor = daysUntilDue > 0 ? "green" : "red";

    return (
      <SectionCard key={plan.id}>
        <h3 className="font-bold">{plan.title}</h3>
        <div className="flex items-center">
          <span className="mr-2">{plan.plan_type}</span>
          <StatusBadge status={plan.status} />
        </div>
        <p>{nextDueDate.toLocaleDateString()}</p>
        <p>{statusText}</p>
        <p>Owner: {plan.owner}</p>
      </SectionCard>
    );
  };

  return (
    <PageWrapper>
      <PageHeader title="Preventive Maintenance Plans" />
      <div className="flex justify-between mb-4">
        <MetricStrip label="Total Plans" value={totalPlans} />
        <MetricStrip label="Active" value={activePlans} />
        <MetricStrip label="Overdue" value={overduePlans} color="red" />
        <MetricStrip label="Due This Week" value={dueThisWeek} />
        <div className="flex">
          <button
            onClick={() => setPlanTypeFilter("all")}
            className={`px-2 py-1 mr-2 ${planTypeFilter === "all" ? "bg-blue-500 text-white" : ""}`}
          >
            All
          </button>
          <button
            onClick={() => setPlanTypeFilter("preventive")}
            className={`px-2 py-1 mr-2 ${planTypeFilter === "preventive" ? "bg-blue-500 text-white" : ""}`}
          >
            Preventive
          </button>
          <button
            onClick={() => setPlanTypeFilter("inspection")}
            className={`px-2 py-1 mr-2 ${planTypeFilter === "inspection" ? "bg-blue-500 text-white" : ""}`}
          >
            Inspection
          </button>
          <button
            onClick={() => setPlanTypeFilter("corrective")}
            className={`px-2 py-1 ${planTypeFilter === "corrective" ? "bg-blue-500 text-white" : ""}`}
          >