// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState } from "@/components/ui";
import Link from "next/link";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchSignals = async () => {
  const response = await authFetch(`/api/v1/ai/signals`).then(r => r.json());
  if (!response.ok) return [];
  return response.json();
};

const fetchKpis = async () => {
  const response = await authFetch(`/api/v1/ai/analytics/kpis/live`).then(r => r.json());
  if (!response.ok) return [];
  return response.json();
};

const fetchTechnicians = async () => {
  const response = await authFetch(`/api/v1/technicians`).then(r => r.json());
  if (!response.ok) return [];
  return response.json();
};

export default function CommandPage() {
  const signalsQuery = useQuery(["signals"], fetchSignals, { refetchInterval: 30000 });
  const kpisQuery = useQuery(["kpis"], fetchKpis, { refetchInterval: 60000 });
  const techniciansQuery = useQuery(["technicians"], fetchTechnicians, { refetchInterval: 120000 });

  if (signalsQuery.isLoading || kpisQuery.isLoading || techniciansQuery.isLoading) return <LoadingState />;

  const signals = Array.isArray(signalsQuery.data) ? signalsQuery.data : (signalsQuery.data?.signals || []);
  const kpis = kpisQuery.data;
  const technicians = techniciansQuery.data;

  return (
    <PageWrapper>
      <PageHeader title="Operations Command Center" />
      <div className="flex justify-between items-center mb-4">
        <StatusBadge status={kpis.system_status} />
        <p>Last Refresh: {new Date().toLocaleTimeString()}</p>
      </div>
      <MetricStrip
        metrics={[
          { label: "Open WOs", value: kpis.open_wo_count },
          { label: "Critical WOs", value: kpis.critical_wo_count },
          { label: "Available Technicians", value: technicians.available_technician_count },
          { label: "Active Signals", value: (signals || []).length },
        ]}
      />
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/operations/work-orders/new" passHref>
          <button className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600">New Work Order</button>
        </Link>
        <Link href="/operations/dispatch" passHref>
          <button className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600">Dispatch Technician</button>
        </Link>
        <Link href="/operations/calendar" passHref>
          <button className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600">View Calendar</button>
        </Link>
        <Link href="/operations/sla-review" passHref>
          <button className="bg-red-500 text-white p-4 rounded-lg hover:bg-red-600">SLA Review</button>
        </Link>
      </div>
      <SectionCard title="Live Signal Feed">
        <ul className="list-disc pl-4">
          {toArr(signals).slice(0, 5).map((signal: any) => (
            <li key={signal.id}>{signal.description}</li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="Technician Status">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {toArr(technicians).slice(0, 5).map((tech: any) => (
            <div key={tech.id} className="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
              <p>{tech.name}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  style={{ width: `${(tech.current_work_orders / tech.max_work_orders) * 100}%` }}
                  className="bg-blue-500 h-full"
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageWrapper>
  );
}