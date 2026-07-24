"use client"; // @ts-nocheck

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

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchProjects = async (section: string) => {
  const response = await fetch(`${BACK}/api/v1/projects?section=${section}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch projects");
  return response.json();
};

const ProjectsSectionPage = () => {
  const { section } = useParams();
  const router = useRouter();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["projects", section],
    queryFn: () => fetchProjects(section!),
    refetchInterval: 300000,
  });

  if (isLoading) return <LoadingState />;
  if (isError && error instanceof Error) return <EmptyState message={error.message} />;

  const projects = data?.projects || [];

  // Rest of the component logic remains unchanged
};