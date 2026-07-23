"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";;
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import Link from "next/link";

const fetchMaintenanceData = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const [signalsResponse, pmPlansResponse, wosResponse, assetsResponse] = await Promise.all([
    fetch("/api/v1/ai/signals?category=maintenance", { credentials: "include" }),
    fetch("/api/v1/maintenance/pm-plans", { credentials: "include" }),
    fetch("/api/v1/work-orders", { credentials: "include" }),
    fetch("/api/v1/assets", { credentials: "include" })
  ]);

  const [signals, pmPlans, wos, assets] = await Promise.all([
    signalsResponse.json(),
    pmPlansResponse.json(),
    wosResponse.json(),
    assetsResponse.json()
  ]);

  return {
    totalActions: signals.length + pmPlans.length + wos.length + assets.length,
    criticalActions: [
      ...signals.filter(signal => signal.urgency === "critical"),
      ...assets.filter(asset => asset.status === "faulted")
    ],
    overduePMs: pmPlans.filter(plan => plan.next_due_date < today),
    openWOs: wos.filter(wo => wo.status === "open")
  };
};

const MaintenanceActionsPage = () => {
  const { data, isLoading, isError } = useQuery(["maintenanceData"], fetchMaintenanceData, {
    refetchInterval: 60000
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState title="Failed to load maintenance actions" />;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <PageWrapper>
      <PageHeader title="Maintenance Actions" />
      <div className="grid grid-cols-3 gap-4">
        <MetricStrip label="Total Actions" value={data.totalActions} />
        <MetricStrip label="Critical Actions" value={data.criticalActions.length} />
        <MetricStrip label="PM Overdue" value={data.overduePMs.length} />
        <MetricStrip label="WOs Open" value={data.openWOs.length} />
      </div>
      <SectionCard title="Critical Actions">
        {data.criticalActions.map(action => (
          <Link href={`/maintenance/actions/${action.id}`} key={action.id}>
            <div className="flex items-center justify-between p-4 border-b last:border-b-0">
              <div>
                <p>{action.description}</p>
                <p className="text-sm text-gray-500">{action.name}</p>
              </div>
              <StatusBadge status={action.urgency} />
            </div>
          </Link>
        ))}
      </SectionCard>
      <SectionCard title="Overdue PM Plans">
        {data.overduePMs.map(plan => (
          <Link href={`/maintenance/pm-plans/${plan.id}`} key={plan.id}>
            <div className="flex items-center justify-between p-4 border-b last:border-b-0">
              <div>
                <p>{plan.description}</p>
                <p className="text-sm text-gray-500">{plan.name}</p>
              </div>
              <StatusBadge status="overdue" />
            </div>
          </Link>
        ))}
      </SectionCard>
      <SectionCard title="Open Work Orders">
        {data.openWOs.map(wo => (
          <Link href={`/maintenance/work-orders/${wo.id}`} key={wo.id}>
            <div className="flex items-center justify-between p-4 border-b last:border-b-0">
              <div>
                <p>{wo.description}</p>
                <p className="text-sm text-gray-500">{wo.name}</p>
              </div>
              <StatusBadge status={wo.status} />
            </div>
          </Link>
        ))}
      </SectionCard>
      <div className="flex justify-between mt-4">
        <Link href="/operations/dispatch" className="btn btn-primary">Dispatch</Link>
        <Link href="/maintenance/pm-plans" className="btn btn-secondary">PM Plans</Link>
      </div>
    </PageWrapper>
  );
};

export default MaintenanceActionsPage;