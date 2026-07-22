"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";

const fetchProjects = async () => {
  const response = await fetch("/api/v1/projects", { credentials: "include" });
  if (!response.ok) throw new Error("No projects");
  return response.json();
};

const fetchWorkOrders = async (contract_id: string) => {
  const response = await fetch(`/api/v1/work-orders?contract_id=${contract_id}`, { credentials: "include" });
  return response.json();
};

const fetchSignals = async (project_id: string) => {
  const response = await fetch(`/api/v1/ai/signals?project_id=${project_id}`, { credentials: "include" });
  return response.json();
};

const ProjectReviewPage = () => {
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Completed" | "On Hold" | "Cancelled">("All");

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    refetchInterval: 300000,
  });

  if (projectsQuery.isError) return <EmptyState title="No projects" description="There are no projects available." />;
  if (projectsQuery.isLoading || !projectsQuery.data) return <LoadingState />;

  const projects = projectsQuery.data;
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === "Active").length;
  const completedProjects = projects.filter(p => p.status === "Completed").length;
  const atRiskProjects = projects.filter(p => p.status === "Active" && new Date(p.end_date) - new Date() <= 14 * 86400000).length;

  return (
    <PageWrapper>
      <PageHeader title="Project Review" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total Projects", value: totalProjects },
            { label: "Active", value: activeProjects, color: "green" },
            { label: "Completed", value: completedProjects, color: "blue" },
            { label: "At Risk", value: atRiskProjects, color: "red" },
          ]}
        />
      </SectionCard>
      <div className="flex gap-4">
        <button
          onClick={() => setStatusFilter("All")}
          className={`px-3 py-2 rounded bg-white border ${
            statusFilter === "All" ? "border-blue-500 text-blue-500" : "text-gray-600"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter("Active")}
          className={`px-3 py-2 rounded bg-white border ${
            statusFilter === "Active" ? "border-green-500 text-green-500" : "text-gray-600"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setStatusFilter("Completed")}
          className={`px-3 py-2 rounded bg-white border ${
            statusFilter === "Completed" ? "border-blue-500 text-blue-500" : "text-gray-600"
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setStatusFilter("On Hold")}
          className={`px-3 py-2 rounded bg-white border ${
            statusFilter === "On Hold" ? "border-yellow-500 text-yellow-500" : "text-gray-600"
          }`}
        >
          On Hold
        </button>
        <button
          onClick={() => setStatusFilter("Cancelled")}
          className={`px-3 py-2 rounded bg-white border ${
            statusFilter === "Cancelled" ? "border-red-500 text-red-500" : "text-gray-600"
          }`}
        >
          Cancelled
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects
          .filter(p => statusFilter === "All" || p.status === statusFilter)
          .map(project => (
            <SectionCard key={project.id}>
              <h3 className="font-bold">{project.name}</h3>
              <StatusBadge status={project.status} />
              <div className="flex items-center gap-2">
                {new Date(project.start_date).toLocaleDateString()} → {new Date(project.end_date).toLocaleDateString()}
              </div>
              <div className="text-red-500" style={{ display: new Date() - new Date(project.end_date) <= 14 * 86400000 ? "block" : "none" }}>
                AT RISK
              </div>
              <div>WO Count: {project.contract_id ? fetchWorkOrders(project.contract_id).then(data => data.length) : 0}</div>
              {project.budget && <div>Budget: {new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(project.budget)}</div>}
            </SectionCard>
          ))}
      </div>
    </PageWrapper>
  );
};

export default ProjectReviewPage;