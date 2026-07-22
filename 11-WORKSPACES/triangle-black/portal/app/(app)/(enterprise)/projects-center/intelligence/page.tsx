"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
} from "@/components/ui";

const fetchProjects = async () => {
  const response = await fetch("/api/v1/projects", { credentials: "include" });
  if (!response.ok) throw new Error("No projects configured");
  return response.json();
};

const fetchSignals = async () => {
  const response = await fetch("/api/v1/ai/signals?category=operations", {
    credentials: "include",
  });
  return response.json();
};

const fetchKpis = async () => {
  const response = await fetch("/api/v1/ai/analytics/kpis/live", {
    credentials: "include",
  });
  return response.json();
};

export default function IntelligencePage() {
  const { data: projects, isLoading, isError } = useQuery(
    ["projects"],
    fetchProjects,
    {
      refetchInterval: 120000,
    }
  );

  const { data: signals, isSignalsLoading, isSignalsError } = useQuery(
    ["signals"],
    fetchSignals,
    {
      refetchInterval: 120000,
    }
  );

  const { data: kpis, isKpisLoading, isKpisError } = useQuery(
    ["kpis"],
    fetchKpis,
    {
      refetchInterval: 120000,
    }
  );

  if (isLoading || isSignalsLoading || isKpisLoading) return <LoadingState />;

  if (isError || isSignalsError || isKpisError) return <EmptyState message="An error occurred" />;

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active" || p.status === "in_progress").length;
  const onTrackProjects = projects.filter(
    (p) => new Date(p.end_date) > new Date() && p.status === "active"
  ).length;
  const atRiskProjects = projects.filter(
    (p) =>
      new Date(p.end_date) < new Date(new Date().setDate(new Date().getDate() + 7)) &&
      p.status === "active"
  ).length;

  return (
    <PageWrapper>
      <PageHeader title="Intelligence Center" />
      <MetricStrip
        metrics={[
          { label: "Total Projects", value: totalProjects },
          { label: "Active Projects", value: activeProjects, color: "green" },
          { label: "On Track Projects", value: onTrackProjects, color: "green" },
          { label: "At Risk Projects", value: atRiskProjects, color: "red" },
        ]}
      />
      <SectionCard title="Project Status Grid">
        {projects
          .sort((a, b) => {
            if (a.status === b.status) return new Date(a.end_date) - new Date(b.end_date);
            if (a.status === "active") return -1;
            if (b.status === "active") return 1;
            return 0;
          })
          .map((project) => (
            <div
              key={project.id}
              className={`p-4 border rounded-lg mb-2 ${
                project.status === "active"
                  ? "bg-green-50 text-green-800"
                  : project.status === "on_hold"
                  ? "bg-yellow-50 text-yellow-800"
                  : project.status === "completed"
                  ? "bg-blue-50 text-blue-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              <h3>{project.name}</h3>
              <div className="flex justify-between">
                <StatusBadge status={project.status} />
                {project.budget && <span>Budget: ${project.budget}</span>}
              </div>
              <p>Start Date: {new Date(project.start_date).toLocaleDateString()}</p>
              <p>End Date: {new Date(project.end_date).toLocaleDateString()}</p>
            </div>
          ))}
      </SectionCard>
      <SectionCard title="AI Intelligence Panel">
        <h4>{signals.length} active signals require attention</h4>
        <a href="/operations/workbench" className="text-blue-500 underline">Go to Operations Workbench</a>
      </SectionCard>
      <SectionCard title="Quick Links">
        <ul>
          <li><a href="/projects-center" className="text-blue-500 underline">All Projects</a></li>
          <li><a href="/operations/workbench" className="text-blue-500 underline">Operations Center</a></li>
          <li><a href="/executive" className="text-blue-500 underline">Executive Dashboard</a></li>
        </ul>
      </SectionCard>
    </PageWrapper>
  );
}