"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import Link from "next/link";


// Safe date formatter
const fmtDate = (d: any): string => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB"); }
  catch { return String(d).slice(0, 10); }
};

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchContracts = async () => {
  const res = await authFetch(`/api/v1/contracts`);
  if (!res.ok) return [];
  return res.json();
};

const fetchInvoices = async () => {
  const res = await authFetch(`/api/v1/invoices`);
  if (!res.ok) return [];
  return res.json();
};

const CustomerHubPage = () => {
  const contractsQuery = useQuery(["contracts"], fetchContracts, { refetchInterval: 300000 });
  const invoicesQuery = useQuery(["invoices"], fetchInvoices, { refetchInterval: 300000 });

  if (contractsQuery.isLoading || invoicesQuery.isLoading) return <LoadingState />;
  if (contractsQuery.isError || invoicesQuery.isError) return <EmptyState />;

  const contracts = contractsQuery.data;
  const invoices = invoicesQuery.data;

  const uniqueClients = Array.from(new Set(toArr(contracts).map(contract => contract.client_name)));
  const totalRevenue = toArr(invoices).reduce((acc: any, invoice: any) => acc + invoice.revenue, 0);
  const expiringSoon = toArr(contracts).filter(contract => Date.now() - new Date(contract.end_date).getTime() < 60 * 24 * 60 * 1000);

  const topClientsByValue = uniqueClients
    .map(clientName => {
      const clientContracts = toArr(contracts).filter(contract => contract.client_name === clientName);
      return {
        clientName,
        contractCount: clientContracts.length,
        totalContractValue: toArr(clientContracts).reduce((acc: any, contract: any) => acc + contract.contract_value, 0),
      };
    })
    .sort((a: any, b: any) => b.totalContractValue - a.totalContractValue)
    .slice(0, 5);

  return (
    <PageWrapper>
      <PageHeader title="Customer Hub" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricStrip label="Total Clients" value={uniqueClients.length} />
        <MetricStrip label="Active Contracts" value={(contracts || []).length} />
        <MetricStrip label="Total Revenue EGP" value={totalRevenue} />
        <MetricStrip label="Expiring Soon" value={expiringSoon.length} />
      </div>
      <SectionCard title="Customer List">
        {toArr(uniqueClients).map(clientName => {
          const clientContracts = toArr(contracts).filter(contract => contract.client_name === clientName);
          const mostRecentContract = clientContracts.sort((a: any, b: any) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())[0];
          return (
            <div key={clientName} className="flex items-center justify-between p-4 border-b last:border-b-0">
              <strong>{clientName}</strong>
              <span>Contract Count: {clientContracts.length}</span>
              <span>Total Contract Value EGP: {toArr(clientContracts).reduce((acc: any, contract: any) => acc + contract.contract_value, 0)}</span>
              <StatusBadge status={mostRecentContract.status} />
              <Link href={`/customers/review?q=${clientName}`} className="text-blue-500 hover:text-blue-700">Review</Link>
            </div>
          );
        })}
      </SectionCard>
      <SectionCard title="Top Clients by Value">
        {toArr(topClientsByValue).map(client => (
          <div key={client.clientName} className="flex items-center justify-between p-4 border-b last:border-b-0">
            <strong>{client.clientName}</strong>
            <span>Contract Count: {client.contractCount}</span>
            <span>Total Contract Value EGP: {client.totalContractValue}</span>
          </div>
        ))}
      </SectionCard>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/customers/360" className="bg-blue-500 text-white p-4 rounded hover:bg-blue-700">Customer 360</Link>
        <Link href="/customers/review" className="bg-blue-500 text-white p-4 rounded hover:bg-blue-700">Review</Link>
      </div>
    </PageWrapper>
  );
};

export default CustomerHubPage;