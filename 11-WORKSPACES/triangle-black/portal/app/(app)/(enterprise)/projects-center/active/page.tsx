// @ts-nocheck
"use client";

import { useQuery } from "react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";
import { Button } from "@/components/ui/Button";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

const ActiveProjectsPage = () => {
  const { data: projects, isLoading, isError } = useQuery(["projects"], () => authFetch("/api/v1/projects/?limit=100").then(r => r.json()), { refetchInterval: 60000 });

  if (isLoading) return <LoadingState />;
  if (isError || !projects) return <EmptyState />;

  const projectCount = projects.length;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  const budgetSpent = projects.reduce((acc, p) => acc + p.budget * (p.completion_pct / 100), 0);
  const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);

  return (
    <PageWrapper>
      <PageHeader title="Active Projects" />
      <div className="grid grid-cols-4 gap-4 mb-8">
        <KPICard value={projectCount} label="Total Projects" />
        <KPICard value={completedProjects} label="Completed Projects" />
        <KPICard value={`$${budgetSpent.toFixed(2)}`} label="Budget Spent" />
        <KPICard value={`$${totalBudget.toFixed(2)}`} label="Total Budget" />
      </div>
      <div className="flex items-center mb-4">
        <input type="text" placeholder="Search projects..." className="border border-slate-300 rounded px-3 py-2 mr-4" />
        <Button>Filter</Button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <TableHeader label="ID" />
            <TableHeader label="Hotel ID" />
            <TableHeader label="Title" />
            <TableHeader label="Description" />
            <TableHeader label="Start Date" />
            <TableHeader label="End Date" />
            <TableHeader label="Budget" />
            <TableHeader label="Status" />
            <TableHeader label="Completion Pct" />
            <TableHeader label="Manager ID" />
            <TableHeader label="Created At" />
            <TableHeader label="Updated At" />
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-3 px-3 text-sm text-slate-700">{project.id}</td>
              <td className="py-3 px-3 text-sm text-slate-700">{project.hotel_id}</td>
              <td className="py-3 px-3 text-sm text-slate-700">{project.title}</td>
              <td className="py-3 px-3 text-sm text-slate-700">{project.description}</td>
              <td className="py-3 px-3 text-sm text-slate-700">{new Date(project.start_date).toLocaleDateString()}</td>
              <td className="py-3 px-3 text-sm text-slate-700">{new Date(project.end_date).toLocaleDateString()}</td>
              <td className="py-3 px-3 text-sm text-slate-700">${project.budget}</td>
              <td className="py-3 px-3 text-sm text-slate-700">
                {project.status === "completed" ? (
                  <StatusBadge status="Completed" />
                ) : project.status === "in_progress" ? (
                  <StatusBadge status="In Progress" />
                ) : (
                  <StatusBadge status="Pending" />
                )}
              </td>
              <td className="py-3 px-3 text-sm text-slate-700">{project.completion_pct}%</td>
              <td className="py-3 px-3 text-sm text-slate-700">{project.manager_id}</td>
              <td className="py-3 px-3 text-sm text-slate-700">{new Date(project.created_at).toLocaleDateString()}</td>
              <td className="py-3 px-3 text-sm text-slate-700">{new Date(project.updated_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageWrapper>
  );
};

const KPICard = ({ value, label }) => (
  <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
    <div className="text-2xl font-bold text-blue-700">{value}</div>
    <div className="text-xs text-slate-500">{label}</div>
  </div>
);

const StatusBadge = ({ status }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
    {status}
  </span>
);

const TableHeader = ({ label }) => (
  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{label}</th>
);

export default ActiveProjectsPage;