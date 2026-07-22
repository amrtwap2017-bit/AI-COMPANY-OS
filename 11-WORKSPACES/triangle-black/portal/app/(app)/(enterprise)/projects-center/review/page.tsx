"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";
import Link from "next/link";

const fetchProjects = async () => {
  const response = await fetch("/api/v1/projects", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch projects");
  return response.json();
};

const fetchWorkOrders = async (contract_id: string) => {
  const response = await fetch(`/api/v1/work-orders?contract_id=${contract_id}`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch work orders");
  return response.json();
};

const ProjectReviewPage = () => {
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Completed" | "On Hold">("All");

  const { data: projects, isLoading, isError } = useQuery(["projects"], fetchProjects, {
    refetchInterval: 300000,
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState title="Failed to load projects" />;

  const today = new Date().toISOString().slice(0, 10);
  const totalProjects = projects.length;
  let activeCount = 0;
  let atRiskCount = 0;
  let completedCount = 0;

  projects.forEach(project => {
    if (project.status === "Active") activeCount++;
    if (project.status === "Completed") completedCount++;
    if (project.status === "On Hold") return;
    const daysRemaining = Math.ceil((new Date(project.end_date) - new Date()) / 86400000);
    if (daysRemaining <= 14) atRiskCount++;
  });

  const filteredProjects = projects.filter(project => {
    if (statusFilter === "All") return true;
    if (statusFilter === "Active" && project.status === "Active") return true;
    if (statusFilter === "Completed" && project.status === "Completed") return true;
    if (statusFilter === "On Hold" && project.status === "On Hold") return true;
    return false;
  });

  const onTrackPercentage = ((totalProjects - atRiskCount) / totalProjects) * 100;

  return (
    <PageWrapper>
      <PageHeader title="Project Review" />
      <div className="flex gap-4">
        <MetricStrip label="Total Projects" value={totalProjects} />
        <MetricStrip label="Active" value={activeCount} />
        <MetricStrip label="At Risk" value={atRiskCount} color="red" />
        <MetricStrip label="Completed" value={completedCount} />
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => setStatusFilter("All")}
          className={`btn ${statusFilter === "All" ? "btn-active" : ""}`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter("Active")}
          className={`btn ${statusFilter === "Active" ? "btn-active" : ""}`}
        >
          Active
        </button>
        <button
          onClick={() => setStatusFilter("Completed")}
          className={`btn ${statusFilter === "Completed" ? "btn-active" : ""}`}
        >
          Completed
        </button>
        <button
          onClick={() => setStatusFilter("On Hold")}
          className={`btn ${statusFilter === "On Hold" ? "btn-active" : ""}`}
        >
          On Hold
        </button>
      </div>
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => {
            const daysRemaining = Math.ceil((new Date(project.end_date) - new Date()) / 86400000);
            return (
              <SectionCard key={project.id}>
                <h3 className="font-bold">{project.name}</h3>
                <StatusBadge status={project.status} />
                <div className="flex items-center gap-2">
                  {daysRemaining <= 14 && <span className="badge badge-error">AT RISK</span>}
                  <span>{`${new Date(project.start_date).toLocaleDateString()} - ${new Date(project.end_date).toLocaleDateString()}`}</span>
                  {daysRemaining > 0 && (
                    <span className={`text-${daysRemaining <= 14 ? "error" : daysRemaining <= 30 ? "warning" : "success"}-600`}>
                      {daysRemaining} days remaining
                    </span>
                  )}
                </div>
                <Link href={`/projects/${project.id}`}>
                  View Work Orders ({fetchWorkOrders(project.contract_id).then(data => data.length)})
                </Link>
              </SectionCard>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No projects found" />
      )}
      <div className="mt-8">
        <h4>Schedule Health Summary</h4>
        <div className="flex items-center gap-2">
          <span>{onTrackPercentage.toFixed(0)}% on track</span>
          <progress value={onTrackPercentage} max="100" className="progress progress-info w-full"></progress>
          <span>{atRiskCount / totalProjects * 100}% at risk</span