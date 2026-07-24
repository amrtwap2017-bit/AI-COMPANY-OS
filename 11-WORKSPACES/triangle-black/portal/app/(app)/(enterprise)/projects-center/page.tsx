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
  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    refetchInterval: 120000,
  });

  // Additional queries can be added here following the same pattern

  return (
    <PageWrapper>
      {/* Render your page content using projects, isLoading, and isError */}
    </PageWrapper>
  );
};

export default ProjectsCenterPage;