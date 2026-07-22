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
  Button,
} from "@/components/ui";

const fetchProjects = async () => {
  const response = await fetch("/api/v1/projects", { credentials: "include" });
  if (!response.ok) throw new Error("No projects configured yet");
  return response.json();
};

const fetchWorkOrders = async (contractId: string) => {
  const response = await fetch(`/api/v1/work-orders?contract_id=${contractId}`, {
    credentials: "include",
  });
  return response.json();
};

const fetchAISignals = async () => {
  const response = await fetch("/api/v1/ai/signals", { credentials: "include" });
  return response.json();
};

const ProjectsCenterPage = () => {
  const { data: projects, isLoading, isError } = useQuery(
    ["projects"],
    fetchProjects,
    {
      refetchInterval: 120000,
    }
  );

  const { data: workOrders } = useQuery(["work-orders"], async () => {
    if (!projects) return [];
    const orders = await Promise.all(projects.map((p) => fetchWorkOrders(p.contract_id)));
    return orders.flat();
  }, {
    enabled: !!projects,
  });

  const { data: aiSignals } = useQuery(["ai-signals"], fetchAISignals, {
    refetchInterval: 120000,
  });

  if (isLoading) return <LoadingState />;
  if (isError || !projects) return <EmptyState title="No projects configured yet" />;

  const activeProjects = projects.filter((p) => p.status === "active");
  const completedProjects = projects.filter((p) => p.status === "completed");
  const onHoldProjects = projects.filter((p) => p.status === "on_hold");

  const daysRemaining = (endDate: Date) => {
    const today = new Date();
    return Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
  };

  const projectCards = projects
    .sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (b.status === "active" && a.status !== "active") return 1;
      return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
    })
    .map((project) => {
      const endDate = new Date(project.end_date);
      const woCount = workOrders.filter((wo) => wo.contract_id === project.contract_id).length;
      const statusColor =
        project.status === "active" ? "green" : project.status === "on_hold" ? "amber" : "blue";
      const daysLeft = daysRemaining(endDate);

      return (
        <div key={project.id} className="col-span-1">
          <SectionCard>
            <h2 className="text-lg font-bold">{project.name}</h2>
            <StatusBadge status={project.status} />
            <p>{`${new Date(project.start_date).toLocaleDateString()} - ${new Date(
              project.end_date
            ).toLocaleDateString()}`}</p>
            <div className={`flex items-center space-x-2 text-sm ${
              daysLeft <= 7 ? "text-red-500" : daysLeft <= 30 ? "text-amber-500" : ""
            }`}>
              {daysLeft} days remaining
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span>{woCount}</span> WO count
            </div>
            <Button href={`/projects-center/${project.id}`}>View Details</Button>
          </SectionCard>
        </div>
      );
    });

  const atRiskProjects = projects.filter((p) => {
    const endDate = new Date(p.end_date);
    return daysRemaining(endDate) <= 14 && p.status === "active";
  });

  const aiSignalsCount = aiSignals?.filter(
    (signal) =>
      signal.category === "operations" || signal.category === "commercial"
  ).length;

  return (
    <PageWrapper>
      <PageHeader title="Projects Center">
        <MetricStrip
          metrics={[
            { label: "Total Projects", value: projects.length },
            { label: "Active", value: activeProjects.length, color: "green" },
            { label: "Completed", value: completedProjects.length, color: "blue" },
            { label: "On Hold", value: onHoldProjects.length, color: "amber" },
          ]}
        />
      </PageHeader>
      <div className="grid grid-cols-2 gap-4">
        {projectCards}
      </div>
      <SectionCard title="Projects at Risk">
        {atRiskProjects.length > 0 ? (
          atRiskProjects.map((project) => {
            const endDate = new Date(project.end_date);
            const daysLeft = daysRemaining(endDate);

            return (
              <div key={project.id} className="flex items-center space-x-2 text-sm">
                <span>{project.name}</span>
                <span>{`${new Date(project.start_date).toLocaleDateString()} - ${new Date(
                  project.end_date
                ).toLocaleDateString()}`}</span>
                <div className={`text-red-500`}>{daysLeft} days remaining</div>
              </div>
            );
          })
        ) : (
          <EmptyState title="No projects at risk" />
        )}
      </SectionCard>
      <SectionCard title="AI Signals">
        {aiSignalsCount ? (
          <Button href="/operations/workbench">View All Signals ({aiSignalsCount})</Button>
        ) : (
          <EmptyState title="No signals need attention" />
        )}
      </SectionCard>
    </PageWrapper>
  );
};

export default ProjectsCenterPage;