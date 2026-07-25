// @ts-nocheck
"use client";

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
  const response = await fetch(`${BACK}/api/v1/ai/signals`, { credentials: "include" });
  return response.json();
};

const fetchKpis = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/analytics/kpis/live`, { credentials: "include" });
  return response.json();
};

const fetchWorkOrders = async () => {
  const response = await fetch(`${BACK}/api/v1/work-orders`, { credentials: "include" });
  return response.json();
};

const ExecutiveExceptionsPage = () => {
  const signalsQuery = useQuery(["signals"], fetchSignals, { refetchInterval: 30000 });
  const kpisQuery = useQuery({ queryKey: ["kpis"], queryFn: fetchKpis });
  const workOrdersQuery = useQuery({ queryKey: ["work-orders"], queryFn: fetchWorkOrders });

  if (signalsQuery.isLoading || kpisQuery.isLoading || workOrdersQuery.isLoading) {
    return <LoadingState />;
  }

  if (signalsQuery.isError || kpisQuery.isError || workOrdersQuery.isError) {
    return <EmptyState message="Failed to load data" />;
  }

  const signals = Array.isArray(signalsQuery.data) ? signalsQuery.data : (signalsQuery.data?.signals || []);
  const kpis = kpisQuery.data;
  const workOrders = workOrdersQuery.data;

  const criticalSignals = (signals || []).filter((signal: any) => signal.priority === "critical");
  const highPrioritySignals = (signals || []).filter((signal: any) => signal.priority === "high");

  const exceptionsCount = criticalSignals.length + highPrioritySignals.length;

  return (
    <PageWrapper>
      <PageHeader title="Executive Exceptions" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricStrip
          title="Critical Signals"
          value={criticalSignals.length}
          badge={<StatusBadge status="red" />}
        />
        <MetricStrip
          title="Critical WOs Open"
          value={(workOrders || []).filter((wo: any) => wo.status === "open").length}
          badge={<StatusBadge status="red" />}
        />
        <MetricStrip
          title="SLA At Risk"
          value={kpis.slaAtRisk ? "Yes" : "No"}
          badge={<StatusBadge status={kpis.slaAtRisk ? "red" : "green"} />}
        />
        <MetricStrip
          title="Exceptions Count"
          value={exceptionsCount}
          badge={<StatusBadge status={exceptionsCount > 0 ? "red" : "green"} />}
        />
      </div>
      {exceptionsCount > 0 && (
        <SectionCard title="Requires Immediate Action">
          {criticalSignals.map((signal: any) => (
            <div key={signal.id} className="border-4 border-red-500 p-4 mb-2 rounded-lg">
              <h3>{signal.title}</h3>
              <p>{signal.message}</p>
              <p>Recommended Action: {signal.recommended_action}</p>
            </div>
          ))}
        </SectionCard>
      )}
      {highPrioritySignals.length > 0 && (
        <SectionCard title="High Priority Items">
          {highPrioritySignals.map((signal: any) => (
            <div key={signal.id} className="border-2 border-yellow-500 p-4 mb-2 rounded-lg">
              <h3>{signal.title}</h3>
              <p>{signal.message}</p>
            </div>
          ))}
        </SectionCard>
      )}
      {exceptionsCount === 0 && (
        <SectionCard title="Status Summary">
          <div className="bg-green-500 text-white p-4 rounded-lg">
            All Systems Normal
          </div>
        </SectionCard>
      )}
      <div className="text-gray-500 text-sm mt-4">
        Last Updated: {new Date().toLocaleString()}
      </div>
    </PageWrapper>
  );
};

export default ExecutiveExceptionsPage;