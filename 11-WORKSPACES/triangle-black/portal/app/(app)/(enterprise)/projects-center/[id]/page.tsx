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
  Progress
} from "@/components/ui";

const fetchProject = async (id: string) => {
  const response = await fetch(`/api/v1/projects?id=${id}`, { credentials: "include" });
  if (!response.ok) throw new Error("Project not found");
  return response.json();
};

const fetchWorkOrders = async (contractId?: string) => {
  const response = await fetch("/api/v1/work-orders", { credentials: "include" });
  const data = await response.json();
  return contractId ? data.filter((wo: any) => wo.contract_id === contractId) : data;
};

const ProjectPage = () => {
  const { id } = useParams();
  const projectQuery = useQuery(["project", id], () => fetchProject(id), { refetchInterval: 120000 });
  const workOrdersQuery = useQuery(["work-orders"], () => fetchWorkOrders(projectQuery.data?.contract_id), { enabled: !!projectQuery.data });

  if (projectQuery.isLoading) return <LoadingState />;
  if (projectQuery.isError) return <EmptyState message="Project not found" />;

  const project = projectQuery.data;
  const workOrders = workOrdersQuery.data || [];

  const totalWOs = workOrders.length;
  const completedWOS = workOrders.filter((wo: any) => wo.status === "completed").length;
  const completionPercentage = (completedWOS / totalWOs) * 100;

  const phases = [
    { name: "Mobilization", weight: 10, status: "In Progress" },
    { name: "Main Works", weight: 70, status: "Completed" },
    { name: "Testing & Commissioning", weight: 15, status: "Pending" },
    { name: "Handover", weight: 5, status: "Not Started" }
  ];

  return (
    <PageWrapper>
      <PageHeader
        title={project.name}
        status={<StatusBadge type={project.status} />}
        dateRange={`${new Date(project.start_date).toLocaleDateString()} - ${new Date(project.end_date).toLocaleDateString()}`}
        daysRemaining={Math.ceil((new Date(project.end_date) - new Date()) / (1000 * 60 * 60 * 24))}
      />
      <SectionCard>
        <MetricStrip
          title="Work Orders"
          metrics={[
            { label: "Total WOs", value: totalWOs },
            { label: "Completed WOs", value: completedWOS },
            { label: "Completion %", value: completionPercentage.toFixed(2) + "%" }
          ]}
        />
      </SectionCard>
      <Progress value={completionPercentage} />
      <SectionCard title="Work Breakdown Structure">
        {phases.map((phase, index) => (
          <div key={index} className="flex items-center justify-between mb-4">
            <span>{phase.name}</span>
            <StatusBadge type={phase.status} />
          </div>
        ))}
      </SectionCard>
      <SectionCard title="Work Orders">
        {workOrders.map((wo: any) => (
          <Link key={wo.id} href={`/work-orders/${wo.id}`} className="flex items-center justify-between mb-4">
            <span>{wo.title}</span>
            <div className="flex items-center space-x-2">
              <StatusBadge type={wo.type} />
              <StatusBadge type={wo.status} />
              {wo.technician && <span>{wo.technician.name}</span>}
            </div>
          </Link>
        ))}
      </SectionCard>
    </PageWrapper>
  );
};

export default ProjectPage;