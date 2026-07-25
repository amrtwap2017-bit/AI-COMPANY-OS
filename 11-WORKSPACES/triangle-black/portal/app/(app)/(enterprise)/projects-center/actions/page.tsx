// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import Link from "next/link";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchProjects = async () => {
  const response = await authFetch(`/api/v1/projects`).then(r => r.json());
  if (!response.ok) return [];
  return response.json();
};

const fetchWorkOrders = async () => {
  const response = await authFetch(`/api/v1/work-orders`).then(r => r.json());
  if (!response.ok) return [];
  return response.json();
};

const fetchSignals = async () => {
  const response = await authFetch(`/api/v1/ai/signals`).then(r => r.json());
  if (!response.ok) return [];
  return response.json();
};

const ProjectsCenterPage = () => {
  const projectsQuery = useQuery(["projects"], fetchProjects, { refetchInterval: 120000 });
  const workOrdersQuery = useQuery(["work-orders"], fetchWorkOrders, { refetchInterval: 120000 });
  const signalsQuery = useQuery(["signals"], fetchSignals, { refetchInterval: 120000 });

  if (projectsQuery.isLoading || workOrdersQuery.isLoading || signalsQuery.isLoading) return <LoadingState />;
  if (projectsQuery.isError || workOrdersQuery.isError || signalsQuery.isError) return <EmptyState />;

  const projects = projectsQuery.data;
  const workOrders = workOrdersQuery.data;
  const signals = Array.isArray(signalsQuery.data) ? signalsQuery.data : (signalsQuery.data?.signals || []);

  const atRiskProjects = toArr(projects).filter(p => new Date(p.end_date).getTime() - new Date().getTime() <= 14 * 24 * 60 * 60 * 1000);
  const openWOs = toArr(workOrders).filter(w => !w.project_id);

  const actionItems = [
    (...atRiskProjects || []).map(p  => ({ project: p, text: "Schedule closeout review", urgency: "high" })),
    ...toArr(projects).filter(p => toArr(openWOs).some(w => w.project_id === p.id)).map(p => ({ project: p, text: "No work orders assigned", urgency: "medium" })),
    ...toArr(signals).filter(s => s.category === "operations").map(s => ({ project: toArr(projects).find(p => p.id === s.project_id), text: s.message, urgency: "low" }))
  ];

  return (
    <PageWrapper>
      <PageHeader title="Project Action Items" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricStrip label="Active Projects" value={(projects || []).length} />
        <MetricStrip label="At Risk" value={atRiskProjects.length} />
        <MetricStrip label="Open WOs" value={openWOs.length} />
        <MetricStrip label="Actions Required" value={actionItems.length} />
      </div>
      {actionItems.length > 0 ? (
        <SectionCard title="Action Items">
          {toArr(actionItems).map((item, index) => (
            <Link key={index} href={`/projects/${item.project.id}`}>
              <div className="flex items-center justify-between p-4 border-b last:border-b-0">
                <div>
                  <h3 className="text-lg font-medium">{item.project.name}</h3>
                  <p className="text-sm text-gray-500">{item.text}</p>
                </div>
                <StatusBadge urgency={item.urgency} />
              </div>
            </Link>
          ))}
        </SectionCard>
      ) : (
        <EmptyState title="No action items" description="All projects are up to date." />
      )}
      <SectionCard title="Completed Actions">
        <EmptyState title="No completed actions tracked" />
      </SectionCard>
    </PageWrapper>
  );
};

export default ProjectsCenterPage;