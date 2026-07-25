// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState } from "@/components/ui";
import Link from "next/link";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchLeads = async () => {
  const res = await authFetch(`/api/v1/leads`);
  return res.json();
};

const fetchContracts = async () => {
  const res = await authFetch(`/api/v1/contracts`);
  return res.json();
};

const fetchSignals = async () => {
  const res = await authFetch(`/api/v1/ai/signals?category=commercial`);
  return res.json();
};

const CommercialPage = () => {
  const leadsQuery = useQuery(["leads"], fetchLeads, { refetchInterval: 300000 });
  const contractsQuery = useQuery(["contracts"], fetchContracts, { refetchInterval: 300000 });
  const signalsQuery = useQuery(["signals"], fetchSignals, { refetchInterval: 300000 });

  if (leadsQuery.isLoading || contractsQuery.isLoading || signalsQuery.isLoading) return <LoadingState />;

  const leadsData = leadsQuery.data;
  const contractsData = contractsQuery.data;
  const signalsData = signalsQuery.data;

  const totalLeads = leadsData?.total || [];
  const wonLeads = leadsData?.won || [];
  const activeContracts = contractsData?.active || [];
  const commercialSignals = signalsData?.length || [];

  const winRate = (wonLeads / totalLeads) * 100 || 0;
  const targetWinRate = 30;

  return (
    <PageWrapper>
      <PageHeader title="Commercial Hub" />
      <div className="grid grid-cols-2 gap-4">
        <MetricStrip label="Total Leads" value={totalLeads} />
        <MetricStrip label="Won" value={wonLeads} />
        <MetricStrip label="Active Contracts" value={activeContracts} />
        <MetricStrip label="Commercial Signals" value={commercialSignals} />
      </div>
      <div className="grid grid-cols-3 gap-4 mt-8">
        <Link href="/commercial/pipeline" passHref>
          <SectionCard title="Pipeline" icon="pipeline" />
        </Link>
        <Link href="/commercial/workbench" passHref>
          <SectionCard title="Workbench" icon="workbench" />
        </Link>
        <Link href="/commercial/command" passHref>
          <SectionCard title="Command" icon="command" />
        </Link>
        <Link href="/commercial/contracts/renewal" passHref>
          <SectionCard title="Contracts Renewal" icon="renewal" />
        </Link>
        <Link href="/commercial/review" passHref>
          <SectionCard title="Review" icon="review" />
        </Link>
        <Link href="/commercial/review-intelligence" passHref>
          <SectionCard title="Review Intelligence" icon="intelligence" />
        </Link>
      </div>
      <div className="mt-8">
        <StatusBadge
          label="Win Rate"
          value={`${(Number(winRate) || 0).toFixed(2)}%`}
          targetValue={`${targetWinRate}%`}
          isTargetMet={winRate >= targetWinRate}
        />
      </div>
      <div className="mt-8">
        <h3>Recent Activity</h3>
        <ul>
          {(leadsData?.wonLeads || []).slice(-3).map((lead: any) => (
            <li key={lead.id}>{lead.name}</li>
          ))}
        </ul>
      </div>
    </PageWrapper>
  );
};

export default CommercialPage;