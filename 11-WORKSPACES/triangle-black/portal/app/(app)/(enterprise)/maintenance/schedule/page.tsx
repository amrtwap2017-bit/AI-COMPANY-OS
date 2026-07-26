// @ts-nocheck
"use client";

import { useQuery } from "react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";
import { Button } from "@/components/ui/Button";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

const MaintenanceSchedulePage = () => {
  const { data, isLoading, isError } = useQuery(["pm-plans"], () => authFetch("/api/v1/maintenance/pm-plans/?limit=100").then(r => r.json()), { refetchInterval: 60000 });

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <EmptyState title="No records" />;

  const pmPlans = toArr(data);

  const kpiData = {
    totalPMs: pmPlans.length,
    upcomingPMs: pmPlans.filter(p => p.next_due_date > new Date()).length,
    overduePMs: pmPlans.filter(p => p.next_due_date < new Date()).length,
    dueSoonPMs: pmPlans.filter(p => p.next_due_date <= new Date(new Date().setDate(new Date().getDate() + 7))).length
  };

  return (
    <PageWrapper>
      <PageHeader title="Maintenance Schedule" />
      <div className="grid grid-cols-4 gap-4">
        <SectionCard title="Total PMs">
          <div className="text-2xl font-bold text-blue-700">{kpiData.totalPMs}</div>
          <div className="text-xs text-slate-500">All Maintenance Plans</div>
        </SectionCard>
        <SectionCard title="Upcoming PMs">
          <div className="text-2xl font-bold text-blue-700">{kpiData.upcomingPMs}</div>
          <div className="text-xs text-slate-500">Next Due Within 30 Days</div>
        </SectionCard>
        <SectionCard title="Overdue PMs">
          <div className="text-2xl font-bold text-blue-700">{kpiData.overduePMs}</div>
          <div className="text-xs text-slate-500">Past Due</div>
        </SectionCard>
        <SectionCard title="Due Soon PMs">
          <div className="text-2xl font-bold text-blue-700">{kpiData.dueSoonPMs}</div>
          <div className="text-xs text-slate-500">Next Due Within 7 Days</div>
        </SectionCard>
      </div>

      <div className="mt-4">
        <input type="search" placeholder="Search..." className="border border-slate-200 px-3 py-2 rounded-md" />
        <select className="border border-slate-200 px-3 py-2 rounded-md ml-2">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <table className="w-full mt-4">
        <thead>
          <tr>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Title</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Plan Type</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Frequency</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Next Due Date</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Status</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Owner</th>
          </tr>
        </thead>
        <tbody>
          {pmPlans.map(p => (
            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-3 px-3 text-sm text-slate-700">{p.title}</td>
              <td className="py-3 px-3 text-sm text-slate-700">{p.plan_type}</td>
              <td className="py-3 px-3 text-sm text-slate-700">{p.frequency}</td>
              <td className="py-3 px-3 text-sm text-slate-700">
                {p.next_due_date.toLocaleDateString()}
                {p.next_due_date <= new Date(new Date().setDate(new Date().getDate() + 7)) && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 ml-2">DUE SOON</span>
                )}
              </td>
              <td className="py-3 px-3 text-sm text-slate-700">
                {p.status === "pending" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Pending</span>
                )}
                {p.status === "in_progress" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">In Progress</span>
                )}
                {p.status === "completed" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Completed</span>
                )}
              </td>
              <td className="py-3 px-3 text-sm text-slate-700">{p.owner}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageWrapper>
  );
};

export default MaintenanceSchedulePage;