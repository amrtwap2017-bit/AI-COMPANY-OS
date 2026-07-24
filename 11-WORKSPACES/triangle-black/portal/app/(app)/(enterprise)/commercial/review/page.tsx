"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import Link from "next/link";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchLeads = async () => {
  const response = await fetch(`${BACK}/api/v1/leads`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch leads");
  return response.json();
};

const fetchContracts = async () => {
  const response = await fetch(`${BACK}/api/v1/contracts`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch contracts");
  return response.json();
};

const CommercialReviewPage = () => {
  const leadsQuery = useQuery(["leads"], fetchLeads, { refetchInterval: 300000 });
  const contractsQuery = useQuery(["contracts"], fetchContracts, { refetchInterval: 300000 });

  if (leadsQuery.isLoading || contractsQuery.isLoading) return <LoadingState />;
  if (leadsQuery.isError || contractsQuery.isError) return <EmptyState />;

  const leads = leadsQuery.data;
  const contracts = contractsQuery.data;

  // Calculate metrics
  const totalLeads = (leads || []).length;
  const wonLeads = (leads || []).filter(lead => lead.status === "won").length;
  const conversionRate = (wonLeads / totalLeads * 100).toFixed(2);
  const activeContracts = (contracts || []).filter(contract => contract.status === "active").length;

  // Lead status summary
  const statusSummary = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  // Top 5 leads by value
  const topLeads = (leads || []).sort((a, b) => b.value - a.value).slice(0, 5);

  // Contract health
  const expiringContracts = (contracts || []).filter(contract => {
    const today = new Date();
    const expirationDate = new Date(contract.expiration_date);
    return expirationDate <= new Date(today.setMonth(today.getMonth() + 1));
  }).length;

  return (
    <PageWrapper>
      <PageHeader title="Commercial Review" />
      <div className="grid grid-cols-3 gap-4">
        <MetricStrip label="Total Leads" value={totalLeads} />
        <MetricStrip label="Won" value={wonLeads} />
        <MetricStrip label="Conversion Rate" value={`${conversionRate}%`} />
        <MetricStrip label="Active Contracts" value={activeContracts} />
      </div>
      <SectionCard title="Lead Status Summary">
        {Object.keys(statusSummary).map(status => (
          <div key={status} className="flex items-center justify-between mb-2">
            <StatusBadge status={status} />
            <span>{`${statusSummary[status]} (${((statusSummary[status] / totalLeads) * 100).toFixed(2)}%)`}</span>
          </div>
        ))}
      </SectionCard>
      <SectionCard title="Top 5 Leads by Value">
        {topLeads.map(lead => (
          <div key={lead.id} className="flex items-center justify-between mb-2">
            <Link href={`/leads/${lead.id}`} className="text-blue-500 hover:underline">{lead.company_name}</Link>
            <StatusBadge status={lead.status} />
            <span>{`${lead.value} EGP`}</span>
          </div>
        ))}
      </SectionCard>
      <SectionCard title="Contract Health">
        <div className="flex items-center justify-between mb-2">
          <span>Active Contracts</span>
          <span>{activeContracts}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span>Expiring Contracts (within 60 days)</span>
          <span>{expiringContracts}</span>
        </div>
      </SectionCard>
      <SectionCard title="Quick Links">
        <Link href="/pipeline" className="block p-2 bg-blue-500 text-white rounded mb-2">Pipeline</Link>
        <Link href="/renewal" className="block p-2 bg-blue-500 text-white rounded mb-2">Renewal</Link>
        <Link href="/customers" className="block p-2 bg-blue-500 text-white rounded">Customers</Link>
      </SectionCard>
    </PageWrapper>
  );
};

export default CommercialReviewPage;