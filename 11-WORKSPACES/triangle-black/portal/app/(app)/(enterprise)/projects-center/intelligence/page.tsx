"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";;
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import Link from "next/link";

const fetchProjects = async () => {
  const response = await fetch("/api/v1/projects", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch projects");
  return response.json();
};

const fetchSignals = async () => {
  const response = await fetch("/api/v1/ai/signals", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch signals");
  return response.json();
};

const fetchWorkOrders = async (projectId: string) => {
  const response = await fetch(`/api/v1/work-orders?project_id=${projectId}`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch work orders");
  return response.json();
};

const ProjectIntelligencePage = () => {
  const { data: projects, isLoading, isError } = useQuery(["projects"], fetchProjects, { refetchInterval: 120000 });
  const { data: signals, isSignalsLoading, isSignalsError } = useQuery(["signals"], fetchSignals, { refetchInterval: 120000 });

  if (isLoading || isSignalsLoading) return <LoadingState />;
  if (isError || isSignalsError) return <EmptyState title="Failed to load data" description="Please try reloading the page." />;

  const totalProjects = projects.length;
  const atRiskCount = projects.filter(p => new Date(p.end_date).getTime() - new Date().getTime() <= 14 * 24 * 60 * 60 * 1000).length;
  const activeSignalsCount = signals.filter(s => s.category === "operations" || s.category === "commercial").length;
  const openWosCount = projects.reduce((acc, p) => acc + fetchWorkOrders(p.id).then(wos => wos.length), 0);

  return (
    <PageWrapper>
      <PageHeader title="Project Intelligence" description="AI insights for project management" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricStrip label="Total Projects" value={totalProjects} />
        <MetricStrip label="At Risk" value={atRiskCount} badge={<StatusBadge status="CRITICAL" />} />
        <MetricStrip label="Active Signals" value={activeSignalsCount} badge={<StatusBadge status="WARNING" />} />
        <MetricStrip label="Open WOs" value={openWosCount} badge={<StatusBadge status="INFO" />} />
      </div>
      <SectionCard title="Project Risk Assessment">
        {projects.map(project => (
          <div key={project.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
            <span>{project.name}</span>
            <StatusBadge status={project.end_date < new Date().toISOString() ? "CRITICAL" : project.end_date - new Date().getTime() <= 14 * 24 * 60 * 60 * 1000 ? "WARNING" : "INFO"} />
          </div>
        ))}
      </SectionCard>
      <SectionCard title="AI Insights">
        {signals.map(signal => (
          <div key={signal.id} className="p-4 border-b last:border-b-0">
            <h3>{signal.title}</h3>
            <p>{signal.description}</p>
          </div>
        ))}
        <Link href="/connect-signals" className="mt-4 block text-center bg-blue-500 text-white px-4 py-2 rounded">Connect these signals to your projects</Link>
      </SectionCard>
      <SectionCard title="Project Actions">
        <Link href="/projects" className="block w-full text-center bg-green-500 text-white px-4 py-2 rounded mb-2">View Projects</Link>
        <Link href="/schedule-review" className="block w-full text-center bg-yellow-500 text-white px-4 py-2 rounded mb-2">Schedule Review</Link>
        <Link href="/actions" className="block w-full text-center bg-red-500 text-white px-4 py-2 rounded">Actions</Link>
      </SectionCard>
    </PageWrapper>
  );
};

export default ProjectIntelligencePage;