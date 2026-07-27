"use client";

import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const fetchOverview = async () => {
  const response = await authFetch("/api/v1/knowledge-graph/overview");
  return response.json();
};

const fetchStats = async () => {
  const response = await authFetch("/api/v1/knowledge-graph/stats");
  return response.json();
};

const GraphPage = () => {
  const { data: overview, isLoading: isOverviewLoading } = useQuery({ queryKey: ["knowledgeGraphOverview"], queryFn: fetchOverview });
  const { data: stats, isLoading: isStatsLoading } = useQuery({ queryKey: ["knowledgeGraphStats"], queryFn: fetchStats });

  if (isOverviewLoading || isStatsLoading) return <LoadingState />;

  const { total_entities, entity_counts, vector_collections, collections } = overview;
  const { entity_breakdown, vector_embeddings } = stats;

  return (
    <PageWrapper>
      <PageHeader title="Knowledge Graph Dashboard" subtitle={`Total Entities: ${total_entities}`} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(entity_counts).map(([type, count]) => (
          <SectionCard key={type} title={type} description={`${count} entities`} />
        ))}
      </div>
      <SectionCard title="Vector Collections" description={vector_collections.join(", ")} />
      <SectionCard title="Graph Status" description={collections.length > 0 ? "Operational" : "Not Operational"} />
    </PageWrapper>
  );
};

export default GraphPage;