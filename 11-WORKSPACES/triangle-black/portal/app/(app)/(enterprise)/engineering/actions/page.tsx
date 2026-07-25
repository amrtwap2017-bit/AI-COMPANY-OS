// @ts-nocheck
"use client";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import Link from "next/link";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchWorkOrders = async () => {
  const response = await fetch(`${BACK}/api/v1/work-orders?type=hvac%2Celectrical%2Cmechanical`, { credentials: "include" });
  if (!response.ok) return [];
  return response.json();
};

const fetchMaintenanceSignals = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/signals?category=maintenance`, { credentials: "include" });
  if (!response.ok) return [];
  return response.json();
};

const fetchPmPlans = async () => {
  const response = await fetch(`${BACK}/api/v1/maintenance/pm-plans`, { credentials: "include" });
  if (!response.ok) return [];
  return response.json();
};

const EngineeringActionsPage = () => {
  const woQuery = useQuery(["work-orders"], fetchWorkOrders, { refetchInterval: 60000 });
  const signalsQuery = useQuery(["maintenance-signals"], fetchMaintenanceSignals, { refetchInterval: 60000 });
  const pmPlansQuery = useQuery(["pm-plans"], fetchPmPlans, { refetchInterval: 60000 });

  if (woQuery.isLoading || signalsQuery.isLoading || pmPlansQuery.isLoading) return <LoadingState />;

  if (woQuery.isError || signalsQuery.isError || pmPlansQuery.isError) return <EmptyState />;

  const criticalWos = (Array.isArray(woQuery.data) ? woQuery.data : []).filter((wo: any) => wo.priority === "critical" && ["hvac", "electrical", "mechanical"].includes(wo.type));
  const overduePmPlans = (Array.isArray(pmPlansQuery.data) ? pmPlansQuery.data : []).filter((plan: any) => new Date(plan.next_due_date) < new Date());
  const maintenanceSignals = signalsQuery.data;

  return (
    <PageWrapper>
      <PageHeader title="Engineering Team Actions" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricStrip label="Engineering WOs Open" value={(woQuery.data || []).length} />
        <MetricStrip label="Critical WOs" value={(criticalWos || []).length} />
        <MetricStrip label="PM Plans Overdue" value={(overduePmPlans || []).length} />
        <MetricStrip label="Maintenance Signals" value={(maintenanceSignals || []).length} />
      </div>
      <SectionCard title="Today's Engineering Actions">
        {(criticalWos || []).map((wo: any) => (
          <Link key={wo.id} href={`/engineering/work-orders/${wo.id}`}>
            <div className="flex items-center justify-between p-2 border-b last:border-b-0">
              <span>{wo.title}</span>
              <StatusBadge type={wo.type} priority={wo.priority} />
            </div>
          </Link>
        ))}
        {(overduePmPlans || []).map((plan: any) => (
          <Link key={plan.id} href={`/engineering/pm-plans/${plan.id}`}>
            <div className="flex items-center justify-between p-2 border-b last:border-b-0">
              <span>{plan.title}</span>
              <StatusBadge type="pm" priority="overdue" />
            </div>
          </Link>
        ))}
        {(maintenanceSignals || []).map((signal: any) => (
          <Link key={signal.id} href={`/engineering/maintenance-signals/${signal.id}`}>
            <div className="flex items-center justify-between p-2 border-b last:border-b-0">
              <span>{signal.title}</span>
              <StatusBadge type="maintenance" priority="signal" />
            </div>
          </Link>
        ))}
      </SectionCard>
      <SectionCard title="Quick Links">
        <ul className="flex flex-col gap-2">
          <li><Link href="/engineering/new-work-order">New WO</Link></li>
          <li><Link href="/engineering/pm-plans">PM Plans</Link></li>
          <li><Link href="/engineering/maintenance-intelligence">Maintenance Intelligence</Link></li>
        </ul>
      </SectionCard>
    </PageWrapper>
  );
};

export default EngineeringActionsPage;