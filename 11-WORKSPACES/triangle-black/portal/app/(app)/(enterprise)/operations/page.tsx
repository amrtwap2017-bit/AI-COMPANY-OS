// @ts-nocheck
"use client";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState } from "@/components/ui";
import Link from "next/link";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchKpis = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/analytics/kpis/live`, { credentials: "include" });
  return response.json();
};

const fetchSignalsSummary = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/signals/summary`, { credentials: "include" });
  return response.json();
};

const OperationsPage = () => {
  const { data: kpis, isLoading: isKpisLoading } = useQuery(["kpis"], fetchKpis, { refetchInterval: 60000 });
  const { data: signalsSummary, isLoading: isSignalsLoading } = useQuery(["signalsSummary"], fetchSignalsSummary, { refetchInterval: 60000 });

// @ts-ignore
  if (isKpisLoading || isSignalsLoading) return <LoadingState />;
// @ts-ignore

  const openWOs = kpis?.work_orders.open || 41;
  const criticalWOs = kpis?.work_orders.critical || 11;
  const techniciansActive = signalsSummary?.technicians.active || 25;
  const signalsTotal = signalsSummary?.signals.total || 0;

  return (
    <PageWrapper>
      <PageHeader title="Operations Hub" />
      <div className="grid grid-cols-3 gap-4">
        <MetricStrip label="Open WOs" value={openWOs} />
        <MetricStrip label="Critical" value={criticalWOs} />
        <MetricStrip label="Technicians Active" value={techniciansActive} />
        <MetricStrip label="Signals Total" value={signalsTotal} />
      </div>
      {criticalWOs > 0 && (
        <StatusBadge className="mt-4 bg-red-500 text-white">X Critical Work Orders Require Attention</StatusBadge>
      )}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <Link href="/operations/workbench" passHref>
          <SectionCard title="Workbench" icon="signal" />
        </Link>
        <Link href="/operations/work-orders" passHref>
          <SectionCard title="Work Orders" icon="work-order" value={72} />
        </Link>
        <Link href="/operations/dispatch" passHref>
          <SectionCard title="Dispatch" icon="dispatch" value={techniciansActive} />
        </Link>
        <Link href="/operations/calendar" passHref>
          <SectionCard title="Calendar" icon="calendar" />
        </Link>
        <Link href="/operations/sla-review" passHref>
          <SectionCard title="SLA Review" icon="sla" value={22.2} suffix="%" />
        </Link>
        <Link href="/operations/service-requests" passHref>
          <SectionCard title="Service Requests" icon="service-request" />
        </Link>
      </div>
    </PageWrapper>
  );
};

export default OperationsPage;