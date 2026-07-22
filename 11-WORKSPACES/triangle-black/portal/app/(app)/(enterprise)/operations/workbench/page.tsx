"use client"; // @ts-nocheck

import { useAuthFetch, useQuery } from "@/lib/hooks";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
  ActionBar,
  Button,
} from "@/components/ui";

const WorkbenchPage = () => {
  const { data: authData, isLoading: isAuthLoading } = useAuthFetch("/api/v1/auth/user");
  const { data: signalsData, isLoading: areSignalsLoading, isError: areSignalsError } = useQuery({
    queryKey: ["ai-signals"],
    queryFn: () => fetch("/api/v1/ai/signals").then((res) => res.json()),
    refetchInterval: 60000,
  });
  const { data: workOrdersData, isLoading: areWorkOrdersLoading } = useQuery({
    queryKey: ["work-orders"],
    queryFn: () => fetch("/api/v1/work-orders").then((res) => res.json()),
  });

  if (isAuthLoading || areSignalsLoading || areWorkOrdersLoading) {
    return <LoadingState />;
  }

  if (areSignalsError || !signalsData || !authData) {
    return <EmptyState title="Failed to load signals" description="Please try reloading the page." />;
  }

  const summary = {
    total: signalsData.signals.length,
    critical: signalsData.signals.filter((signal) => signal.priority === "critical").length,
    high: signalsData.signals.filter((signal) => signal.priority === "high").length,
  };

  return (
    <PageWrapper>
      <PageHeader title="Operations Manager Workbench" />
      <SectionCard title="Metrics">
        <MetricStrip
          metrics={[
            { label: "Total Signals", value: summary.total },
            { label: "Critical", value: summary.critical, color: "red" },
            { label: "High Priority", value: summary.high, color: "amber" },
            { label: "Active Work Orders", value: workOrdersData.work_orders.length },
          ]}
        />
      </SectionCard>
      <SectionCard title="AI Signals">
        {signalsData.signals.length > 0 ? (
          signalsData.signals
            .sort((a, b) => (a.priority === "critical" ? -1 : b.priority === "critical" ? 1 : 0))
            .map((signal) => (
              <div key={signal.signal_id} className="border-l-4 p-3 mb-2">
                <div className={`text-xl font-bold border-l-4 ${signal.priority === "critical" ? "border-red-500" : signal.priority === "high" ? "border-yellow-500" : "border-blue-500"}`}>
                  {signal.title}
                </div>
                <p className="text-sm text-slate-500">{signal.message}</p>
                <p className="italic text-xs">{signal.recommended_action}</p>
                <StatusBadge label={signal.category} />
              </div>
            ))
        ) : (
          <EmptyState title="All systems operational" description="No AI signals at the moment." />
        )}
      </SectionCard>
      <SectionCard title="Quick Actions">
        <ActionBar>
          <Button href="/operations/work-orders/new">New Work Order</Button>
          <Button href="/operations/dispatch">Dispatch Technician</Button>
          <Button href="/supply-chain/workbench">Check Inventory</Button>
        </ActionBar>
      </SectionCard>
      <SectionCard title="Recent Work Orders">
        {workOrdersData.work_orders.slice(0, 5).map((order) => (
          <div key={order.order_id} className="flex items-center justify-between p-3 mb-2 border-b">
            <div>{order.title}</div>
            <StatusBadge label={order.priority} />
            <StatusBadge label={order.status} />
            <div>{order.technician_name}</div>
          </div>
        ))}
      </SectionCard>
    </PageWrapper>
  );
};

export default WorkbenchPage;