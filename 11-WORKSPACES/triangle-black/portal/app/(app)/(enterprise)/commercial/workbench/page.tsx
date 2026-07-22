"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";
import Link from "next/link";

const fetchLeads = async () => {
  const response = await fetch("/api/v1/leads", { credentials: "include" });
  if (!response.ok) throw new Error("No leads found");
  return response.json();
};

const fetchContracts = async () => {
  const response = await fetch("/api/v1/contracts", { credentials: "include" });
  if (!response.ok) throw new Error("No contracts found");
  return response.json();
};

const fetchSignals = async () => {
  const response = await fetch("/api/v1/ai/signals?category=commercial", { credentials: "include" });
  if (!response.ok) throw new Error("No signals found");
  return response.json();
};

const WorkbenchPage = () => {
  const [leads, setLeads] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [signals, setSignals] = useState([]);

  const { data: leadData, isLoading: leadsLoading, isError: leadsError } = useQuery(["leads"], fetchLeads, {
    refetchInterval: 300000,
  });

  const { data: contractData, isLoading: contractsLoading, isError: contractsError } = useQuery(
    ["contracts"],
    fetchContracts,
    {
      refetchInterval: 300000,
    }
  );

  const { data: signalData, isLoading: signalsLoading, isError: signalsError } = useQuery(["signals"], fetchSignals, {
    refetchInterval: 60000,
  });

  if (leadsLoading || contractsLoading || signalsLoading) return <LoadingState />;
  if (leadsError || contractsError || signalsError) return <EmptyState />;

  const totalLeads = leadData.length;
  const wonLeads = leadData.filter(lead => lead.status === "won").length;
  const lostLeads = leadData.filter(lead => lead.status === "lost").length;
  const activeContracts = contractData.filter(contract => contract.status === "active").length;

  return (
    <PageWrapper>
      <PageHeader title="Commercial Manager Workbench" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricStrip label="Total Leads" value={totalLeads} />
        <MetricStrip label="Won Leads" value={wonLeads} />
        <MetricStrip label="Lost Leads" value={lostLeads} />
        <MetricStrip label="Active Contracts" value={activeContracts} />
      </div>
      <SectionCard title="Recent Leads">
        {leadData.slice(0, 8).map((lead, index) => (
          <div key={index} className="flex items-center justify-between p-2 border-b last:border-b-0">
            <span>{lead.company_name}</span>
            <StatusBadge status={lead.status} />
            <span>{lead.value} EGP</span>
          </div>
        ))}
      </SectionCard>
      <SectionCard title="Contract Pipeline">
        {contractData
          .filter(contract => contract.end_date - Date.now() <= 90 * 24 * 60 * 60 * 1000)
          .map((contract, index) => (
            <div key={index} className="flex items-center justify-between p-2 border-b last:border-b-0">
              <span>{contract.name}</span>
              <span>{new Date(contract.end_date).toLocaleDateString()}</span>
              <span>{contract.value} EGP</span>
            </div>
          ))}
      </SectionCard>
      <SectionCard title="AI Signals">
        {signalData.map((signal, index) => (
          <Link key={index} href={`/signals/${signal.id}`} className="block p-2 border-b last:border-b-0 hover:bg-gray-100">
            <div className={`bg-${signal.category}-500 text-white px-4 py-2 rounded-full`}>{signal.title}</div>
          </Link>
        ))}
      </SectionCard>
    </PageWrapper>
  );
};

export default WorkbenchPage;