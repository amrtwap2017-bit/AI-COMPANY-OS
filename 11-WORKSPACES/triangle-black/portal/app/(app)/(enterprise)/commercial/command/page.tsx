"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState } from "@/components/ui";
import Link from "next/link";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchLeads = async () => {
  const res = await authFetch(`/api/v1/leads`);
  if (!res.ok) return [];
  return res.json();
};

const fetchContracts = async () => {
  const res = await authFetch(`/api/v1/contracts`);
  if (!res.ok) return [];
  return res.json();
};

const fetchSignals = async () => {
  const res = await authFetch(`/api/v1/ai/signals?category=commercial`);
  if (!res.ok) return [];
  return res.json();
};

const CommercialCommandPage = () => {
  const leadsQuery = useQuery(["leads"], fetchLeads, { refetchInterval: 120000 });
  const contractsQuery = useQuery(["contracts"], fetchContracts, { refetchInterval: 120000 });
  const signalsQuery = useQuery(["signals"], fetchSignals, { refetchInterval: 60000 });

  if (leadsQuery.isLoading || contractsQuery.isLoading || signalsQuery.isLoading) return <LoadingState />;

  const leads = leadsQuery.data;
  const contracts = contractsQuery.data;
  const signals = Array.isArray(signalsQuery.data) ? signalsQuery.data : (signalsQuery.data?.signals || []);

  const wonLeads = toArr(leads).filter(lead => lead.status === "won").length;
  const totalLeads = (leads || []).length;
  const winRate = ((totalLeads || 1) === 0 ? 0 : (wonLeads / (totalLeads || 1)) * 100) || 0;

  const topActiveLeads = leads
    .filter(lead => !["won", "lost"].includes(lead.status))
    .slice(0, 5)
    .map(lead => ({
      company_name: lead.company_name,
      status: lead.status,
      value: lead.value,
    }));

  const monthlyRevenueEstimate = toArr(contracts).reduce((acc: any, contract: any) => acc + contract.contract_value, 0);

  return (
    <PageWrapper>
      <PageHeader title="Commercial Command Center" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Pipeline Leads">
          <MetricStrip
            label="Pipeline Leads"
            value={totalLeads}
            status={<StatusBadge type="info">0</StatusBadge>}
          />
          <MetricStrip
            label="Won"
            value={wonLeads}
            status={<StatusBadge type="success">{wonLeads}</StatusBadge>}
          />
          <MetricStrip
            label="Active Contracts"
            value={(contracts || []).length}
            status={<StatusBadge type="warning">{(contracts || []).length}</StatusBadge>}
          />
          <MetricStrip
            label="Monthly Revenue Estimate"
            value={monthlyRevenueEstimate}
            status={<StatusBadge type="success">{monthlyRevenueEstimate} EGP</StatusBadge>}
          />
        </SectionCard>
        <SectionCard title="Pipeline Health">
          <div className="flex items-center justify-between">
            <span>Win Rate: {(Number(winRate) || 0).toFixed(2)}%</span>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                style={{ width: `${Math.min(winRate, 30)}%`, backgroundColor: winRate >= 30 ? "green" : "red" }}
                className="h-full"
              />
            </div>
          </div>
          <StatusBadge type={winRate >= 30 ? "success" : "error"}>{winRate >= 30 ? "Above Target" : "Below Target"}</StatusBadge>
        </SectionCard>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Top Active Leads">
          {toArr(topActiveLeads).map((lead, index) => (
            <div key={index} className="flex items-center justify-between">
              <span>{lead.company_name}</span>
              <StatusBadge type={lead.status}>{lead.status}</StatusBadge>
              <span>{lead.value} EGP</span>
            </div>
          ))}
        </SectionCard>
        <SectionCard title="Quick Links">
          <Link href="/commercial/pipeline" className="block p-2 bg-gray-100 rounded hover:bg-gray-200">Pipeline</Link>
          <Link href="/commercial/review" className="block p-2 bg-gray-100 rounded hover:bg-gray-200">Review</Link>
          <Link href="/commercial/contracts/renewal" className="block p-2 bg-gray-100 rounded hover:bg-gray-200">Contracts</Link>
          <Link href="/customers/review" className="block p-2 bg-gray-100 rounded hover:bg-gray-200">Customers</Link>
        </SectionCard>
      </div>
      <SectionCard title="Commercial Signals">
        {toArr(signals).map((signal, index) => (
          <div key={index} className="p-4 border-b last:border-b-0">{signal.message}</div>
        ))}
      </SectionCard>
    </PageWrapper>
  );
};

export default CommercialCommandPage;