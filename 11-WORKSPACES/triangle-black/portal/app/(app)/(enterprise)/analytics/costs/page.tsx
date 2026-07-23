"use client"; // @ts-nocheck

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
  Progress,
} from "@/components/ui";

const fetchCostSummary = async () => {
  const response = await fetch("/api/v1/ai/analytics/costs/summary", {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch cost summary");
  return response.json();
};

const fetchFullReport = async () => {
  const response = await fetch("/api/v1/ai/analytics/costs", {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch full report");
  return response.json();
};

const fetchBOQTemplate = async (wo_type: string) => {
  const response = await fetch(`/api/v1/ai/documents/boq/template?wo_type=${wo_type}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch BOQ template");
  return response.json();
};

const AnalyticsCostsPage = () => {
  const { data: costSummary, isLoading: isSummaryLoading } = useQuery(["costSummary"], fetchCostSummary, {
    refetchInterval: 300000,
  });

  const { data: fullReport, isLoading: isFullReportLoading } = useQuery(["fullReport"], fetchFullReport, {
    refetchInterval: 300000,
  });

  const [selectedBOQTemplate, setSelectedBOQTemplate] = useState<string | null>(null);

  const handleBOQTemplateClick = async (wo_type: string) => {
    try {
      const templateData = await fetchBOQTemplate(wo_type);
      setSelectedBOQTemplate(JSON.stringify(templateData));
    } catch (error) {
      console.error("Error fetching BOQ template:", error);
    }
  };

  if (isSummaryLoading || isFullReportLoading) return <LoadingState />;

  if (!costSummary || !fullReport) return <EmptyState />;

  const { total_wo_cost_egp, avg_wo_cost_egp, portfolio_revenue_egp, margin_pct } = costSummary;
  const { work_orders, contracts } = fullReport;

  const woCostByType = work_orders.reduce((acc, wo) => {
    if (!acc[wo.wo_type]) acc[wo.wo_type] = { total_cost_egp: 0, count: 0 };
    acc[wo.wo_type].total_cost_egp += wo.total_cost_egp;
    acc[wo.wo_type].count++;
    return acc;
  }, {} as Record<string, { total_cost_egp: number; count: number }>);

  const top5ContractsByMargin = contracts
    .sort((a, b) => a.margin_pct - b.margin_pct)
    .slice(0, 5);

  const boqTemplateData = selectedBOQTemplate ? JSON.parse(selectedBOQTemplate) : null;

  return (
    <PageWrapper>
      <PageHeader title="Operational Cost and Profitability — Program F" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SectionCard title="Metrics">
          <MetricStrip
            label="Total WO Cost EGP"
            value={total_wo_cost_egp.toLocaleString()}
            unit="EGP"
          />
          <MetricStrip
            label="Avg WO Cost EGP"
            value={avg_wo_cost_egp.toLocaleString()}
            unit="EGP"
          />
          <MetricStrip
            label="Portfolio Revenue EGP"
            value={portfolio_revenue_egp.toLocaleString()}
            unit="EGP"
          />
          <MetricStrip
            label="Margin %"
            value={`${margin_pct}%`}
            status={
              margin_pct < 20 ? "red" : margin_pct >= 30 ? "green" : "amber"
            }
          />
        </SectionCard>
        <SectionCard title="Margin Gauge">
          <Progress
            value={margin_pct}
            target={30}
            label={`Current: ${margin_pct}% | Target: 30%`}
            status={
              margin_pct < 20 ? "red" : margin_pct >= 30 ? "green" : "amber"
            }
          />
        </SectionCard>
        <SectionCard title="WO Cost by Type">
          {Object.entries(woCostByType).map(([type, data], index) => (
            <div key={index} className="flex items-center justify-between p-2 border-b last:border-b-0">
              <span>{type}</span>
              <span>{data.total_cost_egp.toLocaleString()} EGP</span>
              <span>{data.count} WO</span>
            </div>
          ))}
        </SectionCard>
      </div>
      <SectionCard title="Top 5 Contracts by Margin">
        {top5ContractsByMargin.map((contract, index) => (
          <div key={index} className="flex items-center justify-between p-2 border-b last:border-b-0">
            <span>{contract.client_name}</span>
            <span>{contract.contract_value_egp.toLocaleString()} EGP</span>
            <span>{contract.allocated_cost_egp.toLocaleString()} EGP</span>
            <span>{contract.margin_pct}%</span>
            <StatusBadge
              status={
                contract.margin_pct < 20 ? "red