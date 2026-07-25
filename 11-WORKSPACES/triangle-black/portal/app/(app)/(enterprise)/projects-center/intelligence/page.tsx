// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import Link from "next/link";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchProjects = async () => {
  const res = await authFetch(`/api/v1/projects`);
  if (!res.ok) return [];
  return res.json();
};

const fetchSignals = async () => {
  const res = await authFetch(`/api/v1/ai/signals`);
  if (!res.ok) return [];
  return res.json();
};

const fetchWorkOrders = async (projectId: string) => {
  const res = await authFetch(`/api/v1/work-orders?project_id=${projectId}`);
  if (!res.ok) return [];
  return res.json();
};

const ProjectIntelligencePage = () => {
  const { data: projects, isLoading, isError } = useQuery(["projects"], fetchProjects, { refetchInterval: 120000 });
  const { data: signals, isSignalsLoading, isSignalsError } = useQuery(["signals"], fetchSignals, { refetchInterval: 120000 });

  if (isLoading || isSignalsLoading) return <LoadingState />;
  if (isError || isSignalsError) return <EmptyState title="Failed to load data" description="Please try reloading the page." />;

  const totalProjects = (projects || []).length;
  const atRiskCount = toArr(projects).filter(p => new Date(p.end_date).getTime() - new Date().getTime() <= 14 * 24 * 60 * 60 * 1000).length;
  const activeSignalsCount = toArr(signals).filter(s => s.category === "operations" || s.category === "commercial").length;
  const openWosCount = toArr(projects).reduce((acc: any, p: any) => acc + fetchWorkOrders(p.id).then(wos => (wos || []).length), 0);

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
        {toArr(projects).map(project => (
          <div key={project.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
            <span>{project.name}</span>
            <StatusBadge status={project.end_date < new Date().toISOString() ? "CRITICAL" : project.end_date - new Date().getTime() <= 14 * 24 * 60 * 60 * 1000 ? "WARNING" : "INFO"} />
          </div>
        ))}
      </SectionCard>
      <SectionCard title="AI Insights">
        {toArr(signals).map(signal => (
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