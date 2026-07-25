// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
} from "@/components/ui";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchSignals = async () => {
  const res = await authFetch(`/api/v1/ai/signals`);
  if (!res.ok) return [];
  return res.json();
};

const fetchAnalytics = async () => {
  const res = await authFetch(`/api/v1/ai/analytics/sla`);
  if (!res.ok) return [];
  return res.json();
};

const fetchKpis = async () => {
  const res = await authFetch(`/api/v1/ai/analytics/kpis/live`);
  if (!res.ok) return [];
  return res.json();
};

const ExecutiveIntelligencePage = () => {
  const signalsQuery = useQuery(["signals"], fetchSignals, { refetchInterval: 30000 });
  const analyticsQuery = useQuery(["analytics"], fetchAnalytics, { refetchInterval: 30000 });
  const kpisQuery = useQuery(["kpis"], fetchKpis, { refetchInterval: 30000 });

  if (signalsQuery.isLoading || analyticsQuery.isLoading || kpisQuery.isLoading) {
    return <LoadingState />;
  }

  if (signalsQuery.isError || analyticsQuery.isError || kpisQuery.isError) {
    return <EmptyState message="Failed to load data" />;
  }

  const { total, critical } = signalsQuery.data;
  const { compliance, status } = analyticsQuery.data;
  const { WOs_total, critical_open } = kpisQuery.data;

  const riskMatrix = (signalsQuery.data?.signals || signalsQuery.data || []).map((signal: any) => {
    if (signal.level === "critical") return { level: "HIGH RISK", title: signal.title, action: signal.action };
    if (signal.level === "high") return { level: "MEDIUM RISK", title: signal.title, action: signal.action };
    return null;
  }).filter(Boolean).sort((a: any, b: any) => b.level.localeCompare(a.level));

  const businessImpact = [];
  if (compliance < 80) businessImpact.push("SLA CRITICAL — client contracts at risk");
  if (critical_open > 5) businessImpact.push("OPERATIONS OVERLOAD — resource reallocation needed");
  if (compliance >= 80 && compliance <= 95) businessImpact.push("SLA AT RISK — improvement actions required");

  const trendDirection = total < 2 ? "Improving" : total <= 4 ? "Stable" : "Declining";
  const trendBadgeColor = trendDirection === "Improving" ? "green" : trendDirection === "Stable" ? "amber" : "red";

  return (
    <PageWrapper>
      <PageHeader title="Executive AI Intelligence — Strategic Insights and Risk Alerts" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SectionCard title="Metrics">
          <MetricStrip label="Total Active Signals" value={total} />
          <MetricStrip label="Critical Signals" value={critical} />
          <MetricStrip label="SLA Compliance %" value={`${compliance}%`} />
          <MetricStrip label="Critical WOs Open" value={critical_open} />
        </SectionCard>
        <SectionCard title="Executive Risk Assessment">
          {toArr(riskMatrix).map((item, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <StatusBadge color={item.level === "HIGH RISK" ? "red" : "orange"} />
              <span>{item.title}</span>
              <button className="text-sm text-blue-500 hover:underline">{item.action}</button>
            </div>
          ))}
        </SectionCard>
        <SectionCard title="Business Impact Summary">
          {toArr(businessImpact).map((impact, index) => (
            <p key={index} className="mb-2">{impact}</p>
          ))}
        </SectionCard>
      </div>
      <div className="mt-4">
        <StatusBadge color={trendBadgeColor}>{trendDirection}</StatusBadge>
      </div>
    </PageWrapper>
  );
};

export default ExecutiveIntelligencePage;