"use client";

import { useQuery } from "@tanstack/react-query";
import { LoadingState, MetricStrip, PageHeader, PageWrapper, Progress, SectionCard, StatusBadge } from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchKpis = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/analytics/kpis/live`, { credentials: "include" });
  return response.json();
};

const fetchSla = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/analytics/sla`, { credentials: "include" });
  return response.json();
};

const fetchTrends = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/analytics/trends`, { credentials: "include" });
  return response.json();
};

const calculateGrade = (score: number) => {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "D";
};

const OperationsProgramScorecard = ({ kpis }) => {
  const completedWOs = kpis?.total - kpis?.open;
  const score = ((completedWOs / kpis?.total) * 100).toFixed(2);
  const grade = calculateGrade(score);

  return (
    <SectionCard title="Operations Performance" grade={grade}>
      <MetricStrip label="Total WOs" value={Number(kpis?.total) || 0} />
      <MetricStrip label="Open WOs" value={kpis?.open} />
      <MetricStrip label="Critical Open" value={kpis?.critical} />
      <MetricStrip label="Completion Rate %" value={`${(score) || 0}%`} />
    </SectionCard>
  );
};

const SLAQualityScorecard = ({ sla }) => {
  const score = sla.compliance_rate;
  const grade = calculateGrade(score);
  const gap = (sla.target - sla.compliance_rate).toFixed(2);

  return (
    <SectionCard title="SLA & Quality" grade={grade}>
      <MetricStrip label="SLA Compliance %" value={`${(score) || 0}%`} />
      <MetricStrip label="Target 95%" value={`${(sla.target) || 0}%`} />
      <MetricStrip label="Gap (target - current)" value={`${(gap) || 0}%`} />
      <Progress value={score} max={100} />
    </SectionCard>
  );
};

const ResourceUtilizationScorecard = ({ kpis }) => {
  const score = (100 - kpis?.utilization).toFixed(2);
  const grade = calculateGrade(score);

  return (
    <SectionCard title="Resource Management" grade={grade}>
      <MetricStrip label="Active Technicians" value={Number(kpis?.active) || 0} />
      <MetricStrip label="Utilization %" value={`${(Number(kpis?.utilization) || 0) || 0}%`} />
      <MetricStrip label="Items Below Min Stock" value={kpis?.below_min} />
    </SectionCard>
  );
};

const ProcurementScorecard = ({ kpis }) => {
  const score = (100 - (kpis?.below_minimum / kpis?.total) * 100).toFixed(2);
  const grade = calculateGrade(score);

  return (
    <SectionCard title="Supply Chain" grade={grade}>
      <MetricStrip label="Total POs" value={Number(kpis?.total) || 0} />
      <MetricStrip label="Items Out of Stock" value={kpis?.below_minimum} />
      <MetricStrip label="PO Value EGP" value={kpis?.value_egp} />
    </SectionCard>
  );
};

const AnalyticsPage = () => {
  const { data: kpis, isLoading: isKpisLoading } = useQuery(["kpis"], fetchKpis, { refetchInterval: 60000 });
  const { data: sla, isLoading: isSlaLoading } = useQuery(["sla"], fetchSla, { refetchInterval: 60000 });
  const { data: trends, isLoading: isTrendsLoading } = useQuery(["trends"], fetchTrends, { refetchInterval: 60000 });

  if (isKpisLoading || isSlaLoading || isTrendsLoading) return <LoadingState />;

  return (
    <PageWrapper>
      <PageHeader title="Program Scorecards" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <OperationsProgramScorecard kpis={kpis} />
        <SLAQualityScorecard sla={sla} />
        <ResourceUtilizationScorecard kpis={kpis} />
        <ProcurementScorecard kpis={kpis} />
      </div>
      <table className="w-full mt-8">
        <thead>
          <tr>
            <th>Program</th>
            <th>Score</th>
            <th>Grade</th>
            <th>Status</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Operations Performance</td>
            <td>{((kpis?.total - kpis?.open) / kpis?.total) * 100}</td>
            <td>{calculateGrade(((kpis?.total - kpis?.open) / kpis?.total) * 100)}</td>
            <td>On Track</td>
            <td>Stable</td>
          </tr>
          <tr>
            <td>SLA & Quality</td>
            <td>{sla.compliance_rate}</td>
            <td>{calculateGrade(sla.compliance_rate)}</td>
            <td>Needs Attention</td>
            <td>Stable</td>
          </tr>
          <tr>
            <td>Resource Management</td>
            <td>{100 - kpis?.utilization}</td>
            <td>{calculateGrade(100 - kpis?.utilization)}</td>
            <td>On Track</td>
            <td>Stable</td>
          </tr>
          <tr>
            <td>Supply Chain</td>
            <td>{100 - (kpis?.below_minimum / kpis?.total) * 100}</td>
            <td>{calculateGrade(100 - (kpis?.below_minimum / kpis?.total) * 100)}</td>
            <td>On Track</td>
            <td>Stable</td>
          </tr>
        </tbody>
      </table>
    </PageWrapper>
  );
};

export default AnalyticsPage;