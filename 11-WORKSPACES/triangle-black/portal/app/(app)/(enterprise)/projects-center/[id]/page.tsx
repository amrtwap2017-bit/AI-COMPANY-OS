"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "next/navigation";
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
  return response.json();
};

const fetchWorkOrders = async (contractId: string) => {
  const response = await fetch(`/api/v1/work-orders?contract_id=${contractId}`, { credentials: "include" });
  return response.json();
};

const fetchSignals = async (projectId: string) => {
  const response = await fetch(`/api/v1/ai/signals?project_id=${projectId}`, { credentials: "include" });
  return response.json();
};

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params?.id;

  const { data: projects, isLoading, isError } = useQuery(["projects"], fetchProjects, {
    refetchInterval: 120000,
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState title="Failed to load project" />;

  const project = projects.find(p => p.id === id);

  if (!project) return <EmptyState title="Project not found" action={<Link href="/projects-center">Back to Projects</Link>} />;

  const { name, status, start_date, end_date, contract_id } = project;
  const workOrdersQuery = useQuery(["work-orders", contract_id], () => fetchWorkOrders(contract_id), {
    refetchInterval: 120000,
  });
  const signalsQuery = useQuery(["signals", id], () => fetchSignals(id), { refetchInterval: 120000 });

  return (
    <PageWrapper>
      <PageHeader title={name} action={<StatusBadge status={status} />}>
        {start_date} → {end_date}
      </PageHeader>
      <SectionCard title="Metrics">
        <MetricStrip
          title="Work Orders"
          value={workOrdersQuery.data?.length || 0}
          subValue={workOrdersQuery.data?.filter(w => w.status !== "completed").length || 0}
          extraInfo={`Days Remaining: ${Math.ceil((new Date(end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}`}
        />
      </SectionCard>
      <SectionCard title="Work Orders">
        {workOrdersQuery.isLoading ? (
          <LoadingState />
        ) : workOrdersQuery.isError ? (
          <EmptyState title="Failed to load work orders" />
        ) : (
          workOrdersQuery.data?.map(w => (
            <div key={w.id} className="flex items-center justify-between p-2 border-b">
              {w.title}
              <StatusBadge status={w.status} />
            </div>
          ))
        )}
      </SectionCard>
      <SectionCard title="Quick Links">
        <Link href="/projects-center/review" className="block px-4 py-2 text-blue-500 hover:text-blue-700">Review</Link>
        <Link href="/projects-center/actions" className="block px-4 py-2 text-blue-500 hover:text-blue-700">Actions</Link>
      </SectionCard>
    </PageWrapper>
  );
}