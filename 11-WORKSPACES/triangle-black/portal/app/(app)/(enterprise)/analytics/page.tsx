"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";;
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState } from "@/components/ui";
import Link from "next/link";

const fetchKpis = async () => {
  const response = await fetch("/api/v1/ai/analytics/kpis/live", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch KPIs");
  return response.json();
};

const fetchSla = async () => {
  const response = await fetch("/api/v1/ai/analytics/sla", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch SLA data");
  return response.json();
};

const AnalyticsPage = () => {
  const kpisQuery = useQuery(["kpis"], fetchKpis, { refetchInterval: 120000 });
  const slaQuery = useQuery(["sla"], fetchSla, { refetchInterval: 120000 });

  if (kpisQuery.isLoading || slaQuery.isLoading) return <LoadingState />;

  const {
    work_orders: { open, critical },
    technicians,
    inventory,
    procurement
  } = kpisQuery.data;
  const { compliance_rate, sla_status } = slaQuery.data;

  return (
    <PageWrapper>
      <PageHeader title="Analytics Hub" />
      <div className="grid grid-cols-2 gap-4">
        <SectionCard title="Open WOs" subtitle={open} color="blue" />
        <SectionCard title="Critical WOs" subtitle={critical} color="red" />
        <SectionCard title="SLA Compliance %" subtitle={`${compliance_rate}%`} color="green" />
        <SectionCard title="Avg Completion Rate %" subtitle="22.2%" color="purple" />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Link href="/analytics/sla" passHref>
          <a className="flex items-center justify-between p-4 border-l-4 border-blue-500 bg-white rounded-lg hover:bg-gray-100">
            <div>
              <h3>SLA & Quality</h3>
              <p>{sla_status}</p>
            </div>
            <span className="text-blue-500">→</span>
          </a>
        </Link>
        <Link href="/analytics/trends" passHref>
          <a className="flex items-center justify-between p-4 border-l-4 border-green-500 bg-white rounded-lg hover:bg-gray-100">
            <div>
              <h3>Trends & History</h3>
              <p>22.2%</p>
            </div>
            <span className="text-green-500">→</span>
          </a>
        </Link>
        <Link href="/analytics/scorecards" passHref>
          <a className="flex items-center justify-between p-4 border-l-4 border-purple-500 bg-white rounded-lg hover:bg-gray-100">
            <div>
              <h3>Scorecards</h3>
              <p>4 Programs tracked</p>
            </div>
            <span className="text-purple-500">→</span>
          </a>
        </Link>
        <Link href="/executive" passHref>
          <a className="flex items-center justify-between p-4 border-l-4 border-yellow-500 bg-white rounded-lg hover:bg-gray-100">
            <div>
              <h3>Operational KPIs</h3>
              <p>{technicians}% technician utilization</p>
            </div>
            <span className="text-yellow-500">→</span>
          </a>
        </Link>
      </div>
      <div className="mt-8">
        <MetricStrip title="Total WOs" value={work_orders.total} />
        <MetricStrip title="Completed" value={work_orders.completed} />
        <MetricStrip title="In-Progress" value={work_orders.in_progress} />
        <MetricStrip title="Overdue" value={work_orders.overdue} />
      </div>
    </PageWrapper>
  );
};

export default AnalyticsPage;