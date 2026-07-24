"use client"; // @ts-nocheck

import { PageWrapper, PageHeader, SectionCard, StatusBadge, LoadingState } from "@/components/ui";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const ProjectTimelinePage = () => {
  const fetchProjects = async () => {
    const response = await authFetch("/api/v1/projects");
    return response.json();
  };

  const fetchTransitions = async (projectId: string) => {
    const response = await authFetch(`/api/v1/projects/${projectId}/transitions`);
    return response.json();
  };

  const transitionProject = useMutation({
    mutationFn: async ({ projectId, to, comment }: { projectId: string; to: string; comment: string }) => {
      const response = await authFetch(`/api/v1/projects/${projectId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, comment }),
      });
      return response.json();
    },
    onSuccess: () => {
      toast.success("Transition successful!");
    },
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  if (isLoading) return <LoadingState />;

  return (
    <PageWrapper>
      <PageHeader title="Project Timeline" />
      <div className="flex justify-between mb-4">
        <span>Total Projects: {(projects || []).length}</span>
        <span>Active: {(projects || []).filter(p => p.status === "active").length}</span>
        <span>Planning: {(projects || []).filter(p => p.status === "planning").length}</span>
        <span>Completed: {(projects || []).filter(p => p.status === "completed").length}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(projects || []).map(project => (
          <SectionCard key={project.id}>
            <h3>{project.name}</h3>
            <StatusBadge status={project.status} />
            <div className="mt-4 flex space-x-2">
              {project.allowed_transitions.map(transition => (
                <button
                  key={transition}
                  onClick={() =>
                    transitionProject.mutate({ projectId: project.id, to: transition, comment: "No comment" })
                  }
                  disabled={transitionProject.isLoading}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    transition === "active" ? "bg-green-500 text-white" :
                    transition === "planning" ? "bg-blue-500 text-white" :
                    transition === "on_hold" ? "bg-yellow-500 text-white" :
                    transition === "completed" ? "bg-emerald-500 text-white" :
                    transition === "cancelled" ? "bg-red-500 text-white" :
                    transition === "closed" ? "bg-slate-500 text-white" : ""
                  }`}
                >
                  {transition}
                </button>
              ))}
            </div>
          </SectionCard>
        ))}
      </div>
    </PageWrapper>
  );
};

export default ProjectTimelinePage;