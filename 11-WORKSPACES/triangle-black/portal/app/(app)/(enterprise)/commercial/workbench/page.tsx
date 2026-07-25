// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import Link from "next/link";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const getToday = () => new Date().toISOString().split('T')[0];

const fetchLeads = async () => {
  const res = await authFetch(`/api/v1/leads?created_at=${getToday()}`);
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

const CommercialWorkbenchPage = () => {
  const leadsQuery = useQuery(["leads"], fetchLeads, { refetchInterval: 120000 });
  const contractsQuery = useQuery(["contracts"], fetchContracts, { refetchInterval: 120000 });
  const signalsQuery = useQuery(["signals"], fetchSignals, { refetchInterval: 60000 });

  if (leadsQuery.isLoading || contractsQuery.isLoading || signalsQuery.isLoading) return <LoadingState />;

  if (leadsQuery.isError || contractsQuery.isError || signalsQuery.isError) return <EmptyState />;

  const todayLeads = (Array.isArray(leadsQuery.data) ? leadsQuery.data : []).filter(lead => lead.created_at.startsWith(getToday()));
  const hotLeads = leadsQuery.data
    .filter(lead => ["negotiation", "qualified"].includes(lead.status))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 5);
  const contractRenewals = (Array.isArray(contractsQuery.data) ? contractsQuery.data : []).filter(contract => {
    const endDate = new Date(contract.end_date);
    return endDate >= new Date() && endDate <= new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  });

  return (
    <PageWrapper>
      <PageHeader title="Commercial Workbench" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricStrip
          title="Today's Pipeline"
          value={(todayLeads || []).length}
          icon="/icons/leads.svg"
        />
        <MetricStrip
          title="Won This Week"
          value={(Array.isArray(contractsQuery.data) ? contractsQuery.data : []).filter(contract => contract.status === "won").length}
          icon="/icons/won.svg"
        />
        <MetricStrip
          title="Active Contracts"
          value={(Array.isArray(contractsQuery.data) ? contractsQuery.data : []).filter(contract => contract.status !== "won").length}
          icon="/icons/active-contracts.svg"
        />
        <MetricStrip
          title="Commercial Alerts"
          value={(signalsQuery.data || []).length}
          icon="/icons/alerts.svg"
        />
      </div>
      <SectionCard title="Hot Leads">
        {toArr(hotLeads).map(lead => (
          <div key={lead.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
            <span>{lead.company_name}</span>
            <StatusBadge status={lead.status} />
            <span>${lead.value}</span>
          </div>
        ))}
      </SectionCard>
      <SectionCard title="Contract Renewals Due">
        {toArr(contractRenewals).map(contract => {
          const daysRemaining = Math.ceil((new Date(contract.end_date) - new Date()) / (1000 * 60 * 60 * 24));
          return (
            <div key={contract.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
              <span>{contract.client_name}</span>
              <span>{contract.end_date}</span>
              <span>{daysRemaining} days</span>
              <span>${contract.value}</span>
            </div>
          );
        })}
      </SectionCard>
      <SectionCard title="Commercial Signals">
        {(signalsQuery.data?.signals || signalsQuery.data || []).map(signal => (
          <div key={signal.id} className="p-2 border-b last:border-b-0">
            <p>{signal.description}</p>
          </div>
        ))}
      </SectionCard>
      <SectionCard title="Quick Actions">
        <Link href="/leads/new" className="block p-2 bg-blue-500 text-white rounded">New Lead</Link>
        <Link href="/pipeline" className="block p-2 bg-green-500 text-white rounded">Pipeline</Link>
        <Link href="/contracts" className="block p-2 bg-purple-500 text-white rounded">Contracts</Link>
      </SectionCard>
    </PageWrapper>
  );
};

export default CommercialWorkbenchPage;