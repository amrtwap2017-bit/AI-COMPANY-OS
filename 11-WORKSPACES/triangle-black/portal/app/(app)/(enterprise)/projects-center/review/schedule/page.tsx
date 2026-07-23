"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";;
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";

const fetchProjects = async () => {
  const response = await fetch("/api/v1/projects", { credentials: "include" });
  if (!response.ok) throw new Error("Not found");
  return response.json();
};

const SchedulePage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    refetchInterval: 300000,
  });

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <EmptyState />;

  const today = new Date();
  const totalDays = data.length;
  const onScheduleCount = data.filter(p => new Date(p.end_date) > new Date(today.setDate(today.getDate() + 14))).length;
  const atRiskCount = data.filter(p => new Date(p.end_date) <= new Date(today.setDate(today.getDate() + 14)) && new Date(p.end_date) > today).length;
  const overdueCount = data.filter(p => new Date(p.end_date) < today).length;

  const scheduleHealth = (onScheduleCount / totalDays) * 100;

  return (
    <PageWrapper>
      <PageHeader title="Project Schedule Review" />
      <div className="grid grid-cols-3 gap-4">
        <SectionCard title="Metrics">
          <MetricStrip label="Total Projects" value={totalDays} />
          <MetricStrip label="On Schedule" value={onScheduleCount} color="green" />
          <MetricStrip label="At Risk" value={atRiskCount} color="amber" />
          <MetricStrip label="Overdue" value={overdueCount} color="red" />
        </SectionCard>
        <SectionCard title="Schedule Timeline">
          {data.map(project => (
            <div key={project.id} className="flex items-center justify-between border-b py-2 last:border-b-0">
              <span>{project.name}</span>
              <div className="relative w-full">
                <div
                  className={`absolute left-0 top-0 h-4 bg-gray-300 rounded`}
                  style={{ width: `${Math.min(1, (new Date(project.end_date) - today) / (new Date(project.end_date) - new Date(project.start_date))) * 100}%` }}
                />
                <div
                  className={`absolute left-0 top-0 h-4 rounded bg-${
                    new Date(project.end_date) > new Date(today.setDate(today.getDate() + 14)) ? "green" :
                    new Date(project.end_date) <= new Date(today.setDate(today.getDate() + 14)) && new Date(project.end_date) > today ? "amber" : "red"
                  }`}
                />
              </div>
              <span>{project.start_date} - {project.end_date}</span>
            </div>
          ))}
        </SectionCard>
        <SectionCard title="Upcoming Milestones">
          {data
            .filter(p => new Date(p.end_date) <= new Date(today.setDate(today.getDate() + 30)) && new Date(p.end_date) > today)
            .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
            .map(project => (
              <div key={project.id} className="flex items-center justify-between py-2">
                <span>{project.name}</span>
                <StatusBadge status={new Date(project.end_date) > today ? "on-track" : "at-risk"} />
              </div>
            ))}
        </SectionCard>
      </div>
    </PageWrapper>
  );
};

export default SchedulePage;