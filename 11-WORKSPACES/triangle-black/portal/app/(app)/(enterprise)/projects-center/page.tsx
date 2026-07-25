// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

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

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchProjects = async () => {
  const response = await authFetch(`/api/v1/projects`).then(r => r.json());
  if (!response.ok) return [];
  return response.json();
};

const fetchWorkOrders = async (contractId: string) => {
  const response = await authFetch(`/api/v1/work-orders?contract_id=${contractId}`).then(r => r.json());
  return response.json();
};

const fetchAISignals = async () => {
  const response = await authFetch(`/api/v1/ai/signals`).then(r => r.json());
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