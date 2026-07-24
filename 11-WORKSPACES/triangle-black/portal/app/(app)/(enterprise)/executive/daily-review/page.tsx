"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState } from "@/components/ui";
import Link from "next/link";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchSignals = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/signals`, { credentials: "include" });
  return response.json();
};

const fetchKpisSla = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/analytics/kpis/live`, { credentials: "include" });
  return response.json();
};

const fetchSla = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/analytics/sla`, { credentials: "include" });
  return response.json();
};

export default function DailyReviewPage() {
  const signalsQuery = useQuery(["signals"], fetchSignals, { refetchInterval: 30000 });
  const kpisSlaQuery = useQuery(["kpisSla"], fetchKpisSla, { refetchInterval: 60000 });
  const slaQuery = useQuery(["sla"], fetchSla, { refetchInterval: 60000 });

  if (signalsQuery.isLoading || kpisSlaQuery.isLoading || slaQuery.isLoading) return <LoadingState />;

  const signals = (signalsQuery.data || []).sort((a: any, b: any) => (b.priority||0) - (a.priority||0));
  const totalWOs = 72;
  const openWOs = 41;
  const criticalWOs = 11;
  const compliancePercentage = 22.2;
  const targetSLA = 95;

  return (
    <PageWrapper>
      <PageHeader title={new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })} />
      <MetricStrip
        metrics={[
          { label: "Critical WOs", value: criticalWOs, color: "red" },
          { label: "SLA Compliance %", value: (Number(compliancePercentage) || 0).toFixed(1), color: compliancePercentage < targetSLA ? "orange" : "green" },
          { label: "Active Signals", value: (signals || []).length, color: "blue" },
          { label: "Technician Utilization %", value: 85, color: "purple" }
        ]}
      />
      <div className="grid grid-cols-2 gap-4">
        <SectionCard title="Today's Priorities">
          <ul>
            {(signals || []).map(signal => (
              <li key={signal.id} className={`flex items-center p-2 border-l-4 ${signal.priority === 1 ? 'border-red-500' : signal.priority === 2 ? 'border-yellow-500' : 'border-green-500'}`}>
                <div className="flex-grow">
                  <h3>{signal.title}</h3>
                  <p>{signal.recommended_action}</p>
                </div>
                {signal.priority === 1 ? (
                  <StatusBadge label="Action Required" color="red" />
                ) : (
                  <StatusBadge label="Monitor" color="yellow" />
                )}
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Operational Health">
          <div className="grid grid-cols-2 gap-4">
            <SectionCard title="Operations">
              <p>Open WOs: {openWOs}</p>
              <p>Critical: {criticalWOs}</p>
              <p>Completion Rate: 75%</p>
            </SectionCard>
            <SectionCard title="SLA">
              <p>Compliance %: {(Number(compliancePercentage) || 0).toFixed(1)}%</p>
              <p>Target: {targetSLA}%</p>
              <p>Gap: {targetSLA - compliancePercentage}%</p>
            </SectionCard>
            <SectionCard title="Resources">
              <p>Active Technicians: 20</p>
              <p>Utilization %: 85%</p>
            </SectionCard>
            <SectionCard title="Supply">
              <Link href="/supply-chain/workbench" className="text-blue-500 hover:text-blue-700">Check Inventory</Link>
            </SectionCard>
          </div>
        </SectionCard>
      </div>
      <div className="flex justify-center mt-4 space-x-4">
        <Link href="/dashboard" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">Dashboard</Link>
        <Link href="/reports" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700">Reports</Link>
        <Link href="/tasks" className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-700">Tasks</Link>
        <Link href="/settings" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700">Settings</Link>
      </div>
    </PageWrapper>
  );
}