"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";;
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
} from "@/components/ui";

const fetchLeads = async () => {
  const response = await fetch("/api/v1/leads", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch leads");
  return response.json();
};

const fetchSignals = async () => {
  const response = await fetch("/api/v1/ai/signals?category=commercial", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch signals");
  return response.json();
};

const CommercialReviewIntelligencePage = () => {
  const leadsQuery = useQuery(["leads"], fetchLeads, { refetchInterval: 300000 });
  const signalsQuery = useQuery(["signals"], fetchSignals, { refetchInterval: 300000 });

  if (leadsQuery.isLoading || signalsQuery.isLoading) return <LoadingState />;

  if (leadsQuery.isError || signalsQuery.isError) return <EmptyState message="Failed to load data" />;

  const leads = leadsQuery.data;
  const signals = signalsQuery.data;

  // Calculate metrics
  const wonLeads = leads.filter(lead => lead.status === "won").length;
  const lostLeads = leads.filter(lead => lead.status === "lost").length;
  const activePipeline = leads.length - wonLeads - lostLeads;
  const winRate = (wonLeads / leads.length) * 100;

  // Monthly trend
  const monthlyTrend = Array.from({ length: 3 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - i);
    return {
      month,
      wonCount: leads.filter(lead => 
        lead.created_at >= month.toISOString().split('T')[0] && 
        lead.created_at < new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().split('T')[0]
      ).filter(lead => lead.status === "won").length,
    };
  }).reverse();

  // Best performing stage
  const bestStage = leads.reduce((acc, lead) => {
    if (!acc[lead.status]) acc[lead.status] = 0;
    acc[lead.status]++;
    return acc;
  }, {} as { [key: string]: number });
  const bestStageName = Object.keys(bestStage).reduce((a, b) => (bestStage[a] > bestStage[b] ? a : b), '');

  // Pipeline velocity
  const pipelineVelocity = leads.filter(lead => lead.status === "won").reduce((acc, lead) => {
    const daysDifference = Math.floor((new Date().getTime() - new Date(lead.created_at).getTime()) / (1000 * 3600 * 24));
    return acc + daysDifference;
  }, 0) / leads.filter(lead => lead.status === "won").length;

  return (
    <PageWrapper>
      <PageHeader title="Commercial AI Intelligence" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SectionCard title="Metrics">
          <MetricStrip label="Win Rate %" value={`${winRate.toFixed(2)}%`} />
          <MetricStrip label="Leads Won" value={wonLeads} />
          <MetricStrip label="Leads Lost" value={lostLeads} />
          <MetricStrip label="Active Pipeline" value={activePipeline} />
        </SectionCard>
        <SectionCard title="Win/Loss Analysis">
          {/* Win rate bar vs 30% target */}
          {/* Monthly trend */}
          {/* Best performing stage */}
        </SectionCard>
        <SectionCard title="AI Insights">
          {signals.length > 0 ? (
            signals.map(signal => (
              <div key={signal.id} className="p-4 bg-white rounded-md shadow-md mb-2">
                <h3>{signal.title}</h3>
                <p>{signal.description}</p>
              </div>
            ))
          ) : (
            <EmptyState message="Commercial pipeline healthy" />
          )}
        </SectionCard>
      </div>
    </PageWrapper>
  );
};

export default CommercialReviewIntelligencePage;