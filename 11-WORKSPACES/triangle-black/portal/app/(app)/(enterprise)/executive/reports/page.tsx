"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  Progress,
  EmptyState,
} from "@/components/ui";

const fetchKpis = async () => {
  const response = await fetch("/api/v1/ai/analytics/kpis/live", { credentials: "include" });
  return response.json();
};

const fetchSla = async () => {
  const response = await fetch("/api/v1/ai/analytics/sla", { credentials: "include" });
  return response.json();
};

const fetchTrends = async () => {
  const response = await fetch("/api/v1/ai/analytics/trends", { credentials: "include" });
  return response.json();
};

export default function ExecutiveReportsPage() {
  const kpisQuery = useQuery(["kpis"], fetchKpis, { refetchInterval: 0 });
  const slaQuery = useQuery(["sla"], fetchSla, { refetchInterval: 0 });
  const trendsQuery = useQuery(["trends"], fetchTrends, { refetchInterval: 0 });

  if (kpisQuery.isLoading || slaQuery.isLoading || trendsQuery.isLoading) {
    return <LoadingState />;
  }

  if (kpisQuery.isError || slaQuery.isError || trendsQuery.isError) {
    return <EmptyState />;
  }

  const { work_orders, technicians } = kpisQuery.data;
  const { compliance_rate, sla_status, total_work_orders, completed } = slaQuery.data;
  const { months } = trendsQuery.data;

  return (
    <>
      <style>{'@media print { .no-print { display: none; } }'}</style>
      <PageWrapper className="bg-white">
        <PageHeader
          title="Operations Executive Report"
          subtitle={`Generated: ${new Date().toLocaleString()}`}
          actions={
            <button onClick={() => window.print()} className="no-print bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Print
            </button>
          }
        />
        <SectionCard title="Executive Summary">
          <MetricStrip metrics={[
            { label: "Total Work Orders", value: total_work_orders },
            { label: "Critical Open", value: work_orders.critical_open },
            { label: "SLA Compliance", value: `${compliance_rate}%` },
            { label: "Active Technicians", value: technicians.active },
            { label: "Utilization", value: `${technicians.utilization_pct}%` },
            { label: "Avg Completion Rate", value: `${trendsQuery.data.summary.avg_completion_rate}%` }
          ]} />
        </SectionCard>
        <SectionCard title="SLA Performance">
          <Progress
            value={compliance_rate}
            target={95}
            status={sla_status === "at_risk" ? "red" : "green"}
          />
          {slaQuery.data.sla.by_type.map((type) => (
            <div key={type.type}>
              {type.type}: {type.rate}%
            </div>
          ))}
        </SectionCard>
        <SectionCard title="Monthly Trend Table">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th>Month</th>
                <th>Total WOs</th>
                <th>Completed</th>
                <th>Completion Rate%</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {months.map((month) => (
                <tr key={month.month}>
                  <td>{month.month}</td>
                  <td>{month.total}</td>
                  <td>{month.completed}</td>
                  <td>{month.completion_rate}%</td>
                  <td>
                    <StatusBadge
                      status={
                        month.completion_rate >= 80 ? "green" :
                          month.completion_rate >= 40 ? "amber" : "red"
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
        <SectionCard title="Action Items">
          {work_orders.critical_open > 0 && (
            <div>CRITICAL: {work_orders.critical_open} critical work orders require immediate assignment</div>
          )}
          {compliance_rate < 95 && (
            <div>SLA AT RISK: Compliance at {compliance_rate}% — target 95%</div>
          )}
          <div>Schedule preventive maintenance review</div>
        </SectionCard>
      </PageWrapper>
    </>
  );
}