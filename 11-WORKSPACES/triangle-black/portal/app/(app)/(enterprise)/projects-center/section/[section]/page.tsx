"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
} from "@/components/ui";

const fetchProjects = async (section: string) => {
  const response = await fetch(`/api/v1/projects?section=${section}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch projects");
  return response.json();
};

const ProjectsSectionPage = () => {
  const { section } = useParams();
  const router = useRouter();

  const { data, isLoading, isError, error } = useQuery(
    ["projects", section],
    () => fetchProjects(section!),
    {
      refetchInterval: 300000,
    }
  );

  if (isLoading) return <LoadingState />;
  if (isError && error instanceof Error) return <EmptyState message={error.message} />;

  const projects = data?.projects || [];

  return (
    <PageWrapper>
      <PageHeader title="Projects" breadcrumb={<Link href="/projects-center">Projects</Link>} />
      {section === "reports" ? (
        <div className="flex items-center justify-between">
          <MetricStrip title="Project Count" value={projects.length} />
          <Link href="/executive/reports" className="text-primary hover:underline">
            View Reports
          </Link>
        </div>
      ) : (
        <>
          {projects.length === 0 ? (
            <EmptyState message="No projects found." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <SectionCard
                  key={project.id}
                  title={project.name}
                  status={<StatusBadge status={project.status} />}
                  endDate={project.end_date}
                  WOCount={project.work_orders_count}
                />
              ))}
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
};

export default ProjectsSectionPage;