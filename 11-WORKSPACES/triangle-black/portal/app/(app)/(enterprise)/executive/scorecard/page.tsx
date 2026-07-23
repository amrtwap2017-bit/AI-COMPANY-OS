"use client"; // @ts-nocheck
"use client"; // @ts-nocheck

import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const ExecutiveScorecardPage = () => {
  const fetchScorecard = async () => {
    const response = await authFetch("/api/v1/executive-kpi/scorecard");
    if (!response.ok) throw new Error("Failed to fetch scorecard data");
    return response.json();
  };

  const { isLoading, error, data } = useQuery({
    queryKey: ["scorecard"],
    queryFn: fetchScorecard,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <div>Error fetching scorecard data</div>;

  const { overall, financial, operations, customer, kpis, rev_trend } = data.scorecard;
  const { revenue_egp, wo_completion_pct, active_contracts, portfolio_value_egp, critical_open_wos, technician_utilization_pct } = kpis;

  return (
    <PageWrapper>
      <PageHeader title="Executive Scorecard" period={kpis.period} />
      <div className="flex justify-center mb-8">
        <SectionCard
          title="Overall"
          score={overall}
          color={overall >= 80 ? "green" : overall >= 60 ? "amber" : "red"}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <SectionCard title="Financial" score={financial.score} label={financial.label} />
        <SectionCard title="Operations" score={operations.score} label={operations.label} />
        <SectionCard title="Customer" score={customer.score} label={customer.label} />
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Key Performance Indicators</h3>
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td>Revenue (EGP)</td>
              <td>{revenue_egp}</td>
            </tr>
            <tr>
              <td>Work Order Completion %</td>
              <td>{wo_completion_pct}%</td>
            </tr>
            <tr>
              <td>Active Contracts</td>
              <td>{active_contracts}</td>
            </tr>
            <tr>
              <td>Portfolio Value (EGP)</td>
              <td>{portfolio_value_egp}</td>
            </tr>
            <tr>
              <td>Critical Open WOs</td>
              <td>{critical_open_wos}</td>
            </tr>
            <tr>
              <td>Technician Utilization %</td>
              <td>{technician_utilization_pct}%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Revenue Trend</h3>
        <div className="flex items-center space-x-4">
          {rev_trend.map(({ month, revenue_egp }) => (
            <div key={month} style={{ width: `${(revenue_egp / Math.max(...rev_trend.map(t => t.revenue_egp))) * 100}%`, height: "20px", backgroundColor: "#4caf50" }}></div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default ExecutiveScorecardPage;