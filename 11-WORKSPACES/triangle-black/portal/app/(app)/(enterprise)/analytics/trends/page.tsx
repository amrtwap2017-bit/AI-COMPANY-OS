"use client"; // @ts-nocheck

import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useQuery } from "@tanstack/react-query";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchTrends = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/analytics/trends`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch trends");
  }
  return response.json();
};

export default function TrendsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trends"],
    queryFn: fetchTrends,
    refetchInterval: 300000,
  });

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <EmptyState />;

  const { months, summary } = data;
  const trendBadgeColor = summary.trend === "improving" ? "green" : "blue";

  return (
    <PageWrapper>
      <PageHeader title="Trends" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "6-Month Total WOs", value: summary.total_6_months },
            { label: "6-Month Completed", value: summary.completed_6_months },
            { label: "Avg Completion Rate %", value: (Number(summary.avg_completion_rate) || 0).toFixed(1) },
            { label: "Trend", value: summary.trend, badgeColor: trendBadgeColor },
          ]}
        />
      </SectionCard>

      <SectionCard>
        <div className="flex flex-row gap-4">
          {months.map((month: any) => (
            <div key={month.month} className="flex flex-col items-center">
              <span>{month.month}</span>
              <div
                className={`bg-green-500 h-[${Math.min(month.completion_rate * 1.2, 120)}px] w-10 rounded`}
                style={{
                  backgroundColor: month.completion_rate >= 80 ? "green" : month.completion_rate >= 40 ? "amber" : "red",
                }}
              >
                <span className="absolute bottom-[-30px] text-white">{`${month.completed} of ${month.total} completed (${(Number(month.completion_rate) || 0).toFixed(1)}%)`}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <table className="w-full">
          <thead>
            <tr>
              <th>Month</th>
              <th>Total WOs</th>
              <th>Completed</th>
              <th>Open</th>
              <th>Critical</th>
              <th>Completion Rate %</th>
            </tr>
          </thead>
          <tbody>
            {months.sort((a: any, b: any) => new Date(b.month).getTime() - new Date(a.month).getTime()).map((month: any) => (
              <tr key={month.month}>
                <td>{month.month}</td>
                <td>{month.total}</td>
                <td>{month.completed}</td>
                <td>{month.open}</td>
                <td>{month.critical}</td>
                <td>
                  <StatusBadge value={month.completion_rate} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      <SectionCard>
        <div className="flex flex-row gap-4">
          <div className="bg-green-500 p-2 rounded">Completed: {months.reduce((acc: any, month: any) => acc + month.completed, 0)}</div>
          <div className="bg-yellow-500 p-2 rounded">Open: {months.reduce((acc: any, month: any) => acc + month.open, 0)}</div>
          <div className="bg-red-500 p-2 rounded">Critical: {months.reduce((acc: any, month: any) => acc + month.critical, 0)}</div>
        </div>
      </SectionCard>
    </PageWrapper>
  );
}