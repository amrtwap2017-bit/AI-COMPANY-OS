// @ts-nocheck
"use client";

import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useState } from "react";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

const MaintenancePMPlansPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchPMPlans = async () => {
    const response = await authFetch("/api/v1/maintenance/pm-plans/?limit=100");
    return response.json();
  };

  const { data: pmPlans, isLoading, isError } = useQuery(["pm-plans"], fetchPMPlans, {
    refetchInterval: 60000,
  });

  const filteredPMPlans = toArr(pmPlans).filter((plan) => 
    plan.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === "" || plan.status === statusFilter)
  );

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState title="Failed to load PM plans" />;

  const kpiData = {
    totalPlans: filteredPMPlans.length,
    completedPlans: filteredPMPlans.filter(p => p.status === "completed").length,
    pendingPlans: filteredPMPlans.filter(p => p.status === "pending").length,
    inProgressPlans: filteredPMPlans.filter(p => p.status === "in_progress").length,
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Maintenance PM Plans"
        subtitle="Manage and track your maintenance plans efficiently."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Maintenance" }]}
        actions={
          <>
            <Button variant="primary" size="sm">
              Add New Plan
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-4">
        <SectionCard title="Total Plans" action={<span>{kpiData.totalPlans}</span>} />
        <SectionCard title="Completed" action={<span>{kpiData.completedPlans}</span>} />
        <SectionCard title="Pending" action={<span>{kpiData.pendingPlans}</span>} />
        <SectionCard title="In Progress" action={<span>{kpiData.inProgressPlans}</span>} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search plans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-slate-200 px-3 py-2 rounded-md"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-200 px-3 py-2 rounded-md"
        >
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
        </select>
      </div>

      {filteredPMPlans.length === 0 ? (
        <EmptyState title="No records found" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan Type</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Frequency</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Next Due Date</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPMPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 text-sm text-slate-700">{plan.title}</td>
                  <td className="py-3 px-3 text-sm text-slate-700">{plan.plan_type}</td>
                  <td className="py-3 px-3 text-sm text-slate-700">{plan.frequency}</td>
                  <td className="py-3 px-3 text-sm text-slate-700">{plan.next_due_date}</td>
                  <td className="py-3 px-3 text-sm text-slate-700">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-${plan.status === "completed" ? "green-100 text-green-800" : plan.status === "pending" ? "yellow-100 text-yellow-800" : "red-100 text-red-800"}">${plan.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  );
};

export default MaintenancePMPlansPage;