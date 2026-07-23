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
  Progress,
} from "@/components/ui";

const fetchCostsSummary = async () => {
  const response = await fetch("/api/v1/ai/analytics/costs/summary", {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch costs summary");
  return response.json();
};

const fetchFullReport = async () => {
  const response = await fetch("/api/v1/ai/analytics/costs", {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch full report");
  return response.json();
};

const CostsPage = () => {
  const { data: summary, isLoading: isSummaryLoading } = useQuery(
    ["costs-summary"],
    fetchCostsSummary,
    { refetchInterval: 300000 }
  );

  const { data: report, isLoading: isReportLoading } = useQuery(
    ["full-report"],
    fetchFullReport,
    { refetchInterval: 300000 }
  );

  if (isSummaryLoading || isReportLoading) return <LoadingState />;

  if (!summary || !report) return <EmptyState message="No data available" />;

  const { total_wo_cost_egp, avg_wo_cost_egp, total_contract_value, overall_margin_pct } = summary;
  const { work_orders, contracts } = report;

  const woCostByType = work_orders.reduce((acc, curr) => {
    acc[curr.wo_type] = (acc[curr.wo_type] || 0) + curr.total_cost_egp;
    return acc;
  }, {} as Record<string, number>);

  const top5Contracts = contracts
    .sort((a, b) => b.total_cost_egp - a.total_cost_egp)
    .slice(0, 5);

  return (
    <PageWrapper>
      <PageHeader title="Operational Cost and Profitability Analytics" />
      <SectionCard>
        <MetricStrip
          metrics={[
            {
              label: "Total WO Cost EGP",
              value: total_wo_cost_egp.toLocaleString(),
            },
            {
              label: "Avg WO Cost EGP",
              value: avg_wo_cost_egp.toLocaleString(),
            },
            {
              label: "Contract Revenue EGP",
              value: total_contract_value.toLocaleString(),
            },
            {
              label: "Gross Margin %",
              value: overall_margin_pct.toFixed(2) + "%",
            },
          ]}
        />
      </SectionCard>
      <SectionCard title="Profitability">
        <Progress
          value={overall_margin_pct}
          max={100}
          target={30}
          label={`Gross Margin ${overall_margin_pct.toFixed(2)}%`}
        />
      </SectionCard>
      <SectionCard title="WO Cost by Type">
        <div className="flex flex-wrap gap-4">
          {Object.entries(woCostByType).map(([type, cost]) => (
            <div
              key={type}
              className={`bg-gray-200 p-3 rounded-lg w-full sm:w-1/2 md:w-1/3 lg:w-1/4`}
            >
              <h3 className="text-sm font-medium">{type}</h3>
              <p className="text-base font-bold">{cost.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Top 5 Contracts by Total Cost">
        {top5Contracts.length > 0 ? (
          <ul>
            {top5Contracts.map((contract) => (
              <li key={contract.contract_id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                <div>
                  <p>{contract.client_name}</p>
                  <p className="text-sm text-gray-500">{contract.contract_value.toLocaleString()} EGP</p>
                </div>
                <div>
                  <p className="text-base font-bold">{contract.total_cost_egp.toLocaleString()} EGP</p>
                  <StatusBadge status={contract.margin_pct >= 30 ? "success" : "warning"} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No contracts available" />
        )}
      </SectionCard>
      <div className="text-center text-sm mt-4">
        <p>Costs are estimated from work order type, priority, and duration. Add time-tracking for precision.</p>
      </div>
    </PageWrapper>
  );
};

export default CostsPage;