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
    completedPMs: pmPlans.filter(p => p.status === "completed").length,
    pendingPMs: pmPlans.filter(p => p.status === "pending").length
  };

  return (
    <PageWrapper>
      <PageHeader title="Maintenance Schedule" />
      <div className="grid grid-cols-4 gap-4">
        <SectionCard>
          <KPICard v={kpiData.totalPMs} label="Total PM Plans" />
        </SectionCard>
        <SectionCard>
          <KPICard v={kpiData.upcomingPMs} label="Upcoming PMs" />
        </SectionCard>
        <SectionCard>
          <KPICard v={kpiData.completedPMs} label="Completed PMs" />
        </SectionCard>
        <SectionCard>
          <KPICard v={kpiData.pendingPMs} label="Pending PMs" />
        </SectionCard>
      </div>
      <div className="flex items-center justify-between mt-4">
        <input type="text" placeholder="Search..." className="border border-slate-200 px-3 py-2 rounded-md" />
        <select className="border border-slate-200 px-3 py-2 rounded-md">
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      <table className="w-full mt-4">
        <thead>
          <tr>
            <th>ID</th>
            <th>Asset Node ID</th>
            <th>Title</th>
            <th>Plan Type</th>
            <th>Frequency</th>
            <th>Next Due Date</th>
            <th>Status</th>
            <th>Owner</th>
            <th>Notes</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {pmPlans.map(p => (
            <tr key={p.id} className="hover:bg-slate-50">
              <td>{p.id}</td>
              <td>{p.asset_node_id}</td>
              <td>{p.title}</td>
              <td>{p.plan_type}</td>
              <td>{p.frequency}</td>
              <td>{p.next_due_date.toLocaleDateString()}</td>
              <td><StatusBadge status={p.status} /></td>
              <td>{p.owner}</td>
              <td>{p.notes}</td>
              <td>{p.created_at.toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageWrapper>
  );
};

const KPICard = ({ v, label }) => (
  <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
    <div className="text-2xl font-bold text-blue-700">{v}</div>
    <div className="text-xs text-slate-500">{label}</div>
  </div>
);

const StatusBadge = ({ status }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
    {status}
  </span>
);

export default MaintenanceSchedulePage;