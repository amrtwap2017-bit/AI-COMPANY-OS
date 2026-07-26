// @ts-nocheck
"use client";

import { useQuery } from "@tanstack/react-query";
import { EmptyState, LoadingState, MetricStrip, PageHeader, PageWrapper, Progress, SectionCard, StatusBadge } from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchSLAData = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/analytics/sla`, {
    credentials: "include",
  });
  if (!response.ok) {
    return [];
  }
  return response.json();
};

export default function SLAPage() {
  const { isLoading, error, data } = useQuery({
    queryKey: ["sla"],
    queryFn: fetchSLAData,
    refetchInterval: 60000,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <EmptyState message="Failed to load SLA data" />;

  const {
    compliance_rate,
    sla_target,
    total_work_orders,
    completed,
    open,
    in_progress,
    overdue,
    by_type,
  } = data;

  const complianceStatus =
    compliance_rate >= 95 ? "compliant" : compliance_rate < 80 ? "at_risk" : "warning";

  return (
    <PageWrapper>
      <PageHeader title="SLA Analytics" />
      <div className="grid grid-cols-1 gap-4">
        <SectionCard title="Metrics">
          <MetricStrip
            metrics={[
              {
{ label: "Overall Compliance %",
                value: compliance_rate,
                color:
                  compliance_rate >= 95 ? "green" : compliance_rate < 80 ? "red" : "amber",
              },
              { label: "SLA Target", value: sla_target, color: "gray" },
              { label: "Total WOs", value: total_work_orders, color: "gray" },
              { label: "Completed", value: completed, color: "green" },
              {
                { label: "Overdue",
                value: overdue,
                color: overdue > 0 ? "red" : "gray",
              },
            ]}
          />
        </SectionCard>
        <SectionCard title="Main SLA Gauge">
          <Progress
            value={compliance_rate}
            max={100}
            label={`Current: ${(Number(compliance_rate) || 0).toFixed(2)}% | Target: 95%`}
            status={complianceStatus}
          />
        </SectionCard>
        <SectionCard title="SLA by Work Order Type">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(by_type).map(([type, stats]) => (
              <SectionCard key={type} title={type.charAt(0).toUpperCase() + type.slice(1)}>
                <Progress
                  value={stats.rate}
                  max={100}
                  label={`${stats.completed} of ${stats.total} completed (${(Number(stats.rate) || 0).toFixed(2)}%)`}
                />
                <StatusBadge
                  status={
                    stats.rate >= 80 ? "compliant" : stats.rate >= 50 ? "warning" : "at_risk"
                  }
                >
                  {(Number(stats.rate) || 0).toFixed(2)}%
                </StatusBadge>
              </SectionCard>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Improvement Actions">
          <ul className="list-disc pl-4">
            {compliance_rate < 95 && (
              <li>Priority: Increase work order completion rate by {100 - compliance_rate}%</li>
            )}
            {overdue > 0 && (
              <li>Action: Address {overdue} overdue work orders immediately</li>
            )}
            {by_type.hvac.rate < by_type.electrical.rate && (
              <li>Focus: HVAC completion rate below electrical</li>
            )}
            <li>Recommendation: Schedule weekly SLA review meetings</li>
          </ul>
        </SectionCard>
      </div>
    </PageWrapper>
  );
}