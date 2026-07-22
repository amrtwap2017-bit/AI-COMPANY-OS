"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";

const fetchPMPlans = async () => {
  const response = await fetch("/api/v1/maintenance/pm-plans", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch PM plans");
  return response.json();
};

const fetchAssets = async () => {
  const response = await fetch("/api/v1/assets", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch assets");
  return response.json();
};

const MaintenanceReviewPage = () => {
  const today = new Date().toISOString().slice(0, 10);
  const weekEnds = Array.from({ length: 4 }, (_, i) => new Date(Date.now() + (i + 1) * 7 * 86400000).toISOString().slice(0, 10));

  const { data: pmPlansData, isLoading: isPMPlansLoading, error: pmPlansError } = useQuery(["pm-plans"], fetchPMPlans, {
    refetchInterval: 120000,
  });

  const { data: assetsData, isLoading: isAssetsLoading, error: assetsError } = useQuery(["assets"], fetchAssets, {
    refetchInterval: 120000,
  });

  if (isPMPlansLoading || isAssetsLoading) return <LoadingState />;
  if (pmPlansError || assetsError) return <EmptyState />;

  const pmPlans = pmPlansData as { next_due_date: string; frequency: string; status: string; plan_type: string }[];
  const assets = assetsData as { asset_node_id: string; name: string }[];

  // Calculate metrics
  const totalPlans = pmPlans.length;
  const overdueCount = pmPlans.filter(p => p.next_due_date < today).length;
  const dueThisWeekCount = pmPlans.filter(p => p.next_due_date >= today && p.next_due_date <= weekEnds[0]).length;
  const dueThisMonthCount = pmPlans.filter(p => p.next_due_date >= today && p.next_due_date <= new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10)).length;

  // Frequency distribution
  const frequencyDistribution = pmPlans.reduce((acc, plan) => {
    acc[plan.frequency] = (acc[plan.frequency] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  return (
    <PageWrapper>
      <PageHeader title="Maintenance Schedule Review" />
      <div className="grid grid-cols-4 gap-4">
        <MetricStrip label="Total Plans" value={totalPlans} />
        <MetricStrip label="Overdue" value={overdueCount} status={StatusBadge.Danger} />
        <MetricStrip label="Due This Week" value={dueThisWeekCount} status={StatusBadge.Warning} />
        <MetricStrip label="Due This Month" value={dueThisMonthCount} status={StatusBadge.Success} />
      </div>
      {/* Schedule view */}
      {weekEnds.map((weekEnd, index) => (
        <SectionCard key={index}>
          <h3 className="text-lg font-semibold">Week {index + 1}</h3>
          <ul>
            {pmPlans
              .filter(p => p.next_due_date >= today && p.next_due_date <= weekEnd)
              .slice(0, 3)
              .map((plan, i) => (
                <li key={i}>{assets.find(a => a.asset_node_id === plan.plan_type)?.name}</li>
              ))}
          </ul>
        </SectionCard>
      ))}
      {/* Full Schedule Table */}
      <SectionCard>
        <h3 className="text-lg font-semibold">Full Schedule</h3>
        <table className="w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>Frequency</th>
              <th>Next Due Date</th>
              <th>Days Until Due</th>
            </tr>
          </thead>
          <tbody>
            {pmPlans
              .sort((a, b) => {
                if (a.next_due_date < b.next_due_date) return -1;
                if (a.next_due_date > b.next_due_date) return 1;
                return 0;
              })
              .map((plan, index) => (
                <tr key={index}>
                  <td>{assets.find(a => a.asset_node_id === plan.plan_type)?.name}</td>
                  <td className="text-center">{plan.frequency}</td>
                  <td>{plan.next_due_date}</td>
                  <td className={`text-center ${new Date(plan.next_due_date).toISOString().slice(0, 10) < today ? "text-red-500" : new Date(plan.next_due_date).toISOString().slice(0, 10) - today <= 7 ? "text-yellow-500" : "text-green-500"}`}>
                    {new Date(plan.next_due_date).toISOString().slice(0, 10) < today ? "Overdue" : new Date(plan.next_due_date).toISOString().slice(0, 10) - today}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </