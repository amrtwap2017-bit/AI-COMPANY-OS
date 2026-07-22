"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  Progress,
} from "@/components/ui";

const fetchKpis = async () => {
  const response = await fetch("/api/v1/ai/analytics/kpis/live", { credentials: "include" });
  return response.json();
};

const fetchSLA = async () => {
  const response = await fetch("/api/v1/ai/analytics/sla", { credentials: "include" });
  return response.json();
};

const fetchTrends = async () => {
  const response = await fetch("/api/v1/ai/analytics/trends", { credentials: "include" });
  return response.json();
};

export default function ReportsPage() {
  const { data: kpis, isLoading: isKpisLoading } = useQuery(["kpis"], fetchKpis, { refetchInterval: 0 });
  const { data: sla, isLoading: isSLALoading } = useQuery(["sla"], fetchSLA, { refetchInterval: 0 });
  const { data: trends, isLoading: isTrendsLoading } = useQuery(["trends"], fetchTrends, { refetchInterval: 0 });

  if (isKpisLoading || isSLALoading || isTrendsLoading) return <LoadingState />;

  const complianceRate = sla.compliance_rate;
  const criticalCount = kpis.critical_count;
  const actionItems = [];

  if (complianceRate < 95) actionItems.push("SLA AT RISK");
  if (criticalCount > 5) actionItems.push("OPERATIONS OVERLOAD");

  return (
    <PageWrapper>
      <PageHeader title="Executive Reports" />
      <div className="flex flex-col gap-4">
        <button onClick={() => window.print()} className="no-print bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Print
        </button>
        <p>{new Date().toLocaleDateString()}</p>
        <SectionCard title="Metrics">
          <MetricStrip label="Open WOs" value={kpis.open_wos} />
          <MetricStrip label="Critical" value={criticalCount} />
          <MetricStrip label="SLA %" value={`${sla.sla_percentage}%`} />
          <MetricStrip label="Avg Completion %" value={`${kpis.avg_completion_percentage}%`} />
        </SectionCard>
        <SectionCard title="SLA Progress">
          <Progress value={complianceRate} max={95} />
        </SectionCard>
        <SectionCard title="Monthly Trends">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th>Month</th>
                <th>Total</th>
                <th>Completed</th>
                <th>Rate%</th>
              </tr>
            </thead>
            <tbody>
              {trends.map((month) => (
                <tr key={month.month}>
                  <td>{month.month}</td>
                  <td>{month.total}</td>
                  <td>{month.completed}</td>
                  <td>{month.rate_percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
        {actionItems.length > 0 && (
          <SectionCard title="Action Items">
            <ul className="list-disc pl-4">
              {actionItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </SectionCard>
        )}
      </div>
    </PageWrapper>
  );
}