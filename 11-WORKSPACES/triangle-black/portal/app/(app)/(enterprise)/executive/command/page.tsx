// @ts-nocheck
"use client";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState } from "@/components/ui";
import Link from "next/link";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchSignals = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/signals`, { credentials: "include" });
  if (!response.ok) return [];
  return response.json();
};

const fetchKpisSla = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/analytics/kpis/live`, { credentials: "include" });
  if (!response.ok) return [];
  return response.json();
};

const fetchSLA = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/analytics/sla`, { credentials: "include" });
  if (!response.ok) return [];
  return response.json();
};

const ExecutiveCommandPage = () => {
  const { data: signals, isLoading: signalsLoading } = useQuery(["signals"], fetchSignals, { refetchInterval: 30000 });
  const { data: kpisSla, isLoading: kpisSlaLoading } = useQuery(["kpisSla"], fetchKpisSla, { refetchInterval: 60000 });
  const { data: sla, isLoading: slaLoading } = useQuery(["sla"], fetchSLA, { refetchInterval: 60000 });

  const [scheduleMeeting, setScheduleMeeting] = useState(false);

  if (signalsLoading || kpisSlaLoading || slaLoading) return <LoadingState />;

  const criticalSignalsCount = signals?.critical || 0;
  const status = criticalSignalsCount > 0 ? "CRITICAL ALERT" : "NOMINAL";

  const topSignals = signals?.top_(signals || []).slice(0, 3);

  return (
    <PageWrapper>
      <PageHeader title="Executive Command Center" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SectionCard title="Status">
          <StatusBadge status={status} />
        </SectionCard>
        <MetricStrip
          metrics={[
            { label: "Critical Signals", value: criticalSignalsCount },
            { label: "Critical WOs", value: signals?.critical_wos || 0 },
            { label: "SLA Status", value: sla?.sla_status || "OK" },
            { label: "Technician Utilization %", value: kpisSla?.technician_utilization || 0 },
          ]}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link href="/operations/command" passHref>
          <SectionCard title="Operations">Go to Operations</SectionCard>
        </Link>
        <Link href="/supply-chain/command" passHref>
          <SectionCard title="Supply Chain">Go to Supply Chain</SectionCard>
        </Link>
        <Link href="/maintenance/intelligence" passHref>
          <SectionCard title="Maintenance">Go to Maintenance</SectionCard>
        </Link>
        <Link href="/customers/review" passHref>
          <SectionCard title="Finance">Go to Finance</SectionCard>
        </Link>
        <Link href="/alerts" passHref>
          <SectionCard title="Alerts">Go to Alerts</SectionCard>
        </Link>
        <Link href="/executive/reports" passHref>
          <SectionCard title="Reports">Go to Reports</SectionCard>
        </Link>
      </div>
      <div className="mt-4">
        <h2>Live Signal Feed</h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topSignals.map((signal, index) => (
            <li key={index} className={`bg-${signal.priority}-500 text-white p-2 rounded`}>
              {signal.message}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <h2>Quick Decisions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/operations/dispatch" passHref>
            <button className="bg-blue-500 text-white p-2 rounded">Dispatch All Available</button>
          </Link>
          <Link href="/supply-chain/workbench" passHref>
            <button className="bg-green-500 text-white p-2 rounded">Create Emergency PR</button>
          </Link>
          <button
            onClick={() => setScheduleMeeting(true)}
            className={`bg-purple-500 text-white p-2 rounded ${scheduleMeeting ? "bg-gray-400 cursor-not-allowed" : ""}`}
            disabled={scheduleMeeting}
          >
            {scheduleMeeting ? "Scheduled" : "Schedule Board Meeting"}
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ExecutiveCommandPage;