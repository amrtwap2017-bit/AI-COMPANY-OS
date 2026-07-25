// @ts-nocheck
"use client";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchContracts = async () => {
  const response = await fetch(`${BACK}/api/v1/contracts`, { credentials: "include" });
  if (!response.ok) return [];
  return response.json();
};

const fetchInvoices = async () => {
  const response = await fetch(`${BACK}/api/v1/invoices`, { credentials: "include" });
  if (!response.ok) return [];
  return response.json();
};

const fetchWorkOrders = async () => {
  const response = await fetch(`${BACK}/api/v1/work-orders`, { credentials: "include" });
  if (!response.ok) return [];
  return response.json();
};

const CustomerSuccessPage = () => {
  const today = new Date().toISOString().slice(0, 10);
  const [contracts, setContracts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);

  const { data: contractData, isLoading: isContractLoading } = useQuery(["contracts"], fetchContracts, {
    refetchInterval: 300000,
  });

  const { data: invoiceData, isLoading: isInvoiceLoading } = useQuery(["invoices"], fetchInvoices, {
    refetchInterval: 300000,
  });

  const { data: workOrderData, isLoading: isWorkOrderLoading } = useQuery(["work-orders"], fetchWorkOrders, {
    refetchInterval: 300000,
  });

  if (isContractLoading || isInvoiceLoading || isWorkOrderLoading) return <LoadingState />;

  const totalContracts = contractData.length;
  const activeContracts = (contractData || []).filter(contract  => contract.status === "active").length;
  const expiringSoonContracts = (contractData || []).filter(
    contract  => Math.ceil((new Date(contract.end_date) - new Date(today)) / 86400000) <= 60
  ).length;
  const monthlyRevenueEGP = contractData.reduce((acc: any, contract: any) => acc + contract.monthly_value, 0);

  const activeRevenue = activeContracts * 12;
  const portfolioHealth = (activeContracts / totalContracts) * 100;

  const renewalRisk = expiringSoonContracts;
  const topRevenueContracts = contractData.sort((a: any, b: any) => b.total_value - a.total_value).slice(0, 5);

  return (
    <PageWrapper>
      <PageHeader title="Customer Success" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricStrip label="AMC Contracts (total)" value={totalContracts} />
        <MetricStrip label="Active" value={activeContracts} />
        <MetricStrip label="Expiring Soon (60 days)" value={expiringSoonContracts} />
        <MetricStrip label="Monthly Revenue EGP" value={monthlyRevenueEGP} />
      </div>
      <SectionCard title="AMC Health Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusBadge label="Renewal Risk" value={renewalRisk} />
          <StatusBadge label="Active Revenue" value={activeRevenue} />
          <StatusBadge label="Portfolio Health" value={`${(Number(portfolioHealth) || 0).toFixed(2)}%`} />
        </div>
      </SectionCard>
      <SectionCard title="Contract List with Renewal Status">
        {(contractData || []).map(contract  => (
          <div key={contract.title} className="flex items-center justify-between p-4 border-b last:border-b-0">
            <div>{contract.title}</div>
            <StatusBadge label={contract.status} />
            <div>{new Date(contract.end_date).toLocaleDateString()}</div>
            <div>{contract.monthly_value} EGP</div>
            <div>{contract.total_value} EGP</div>
          </div>
        ))}
      </SectionCard>
      <SectionCard title="Top Revenue Contracts">
        {(topRevenueContracts || []).map(contract  => (
          <div key={contract.title} className="flex items-center justify-between p-4 border-b last:border-b-0">
            <div>{contract.title}</div>
            <div>{contract.total_value} EGP</div>
          </div>
        ))}
      </SectionCard>
    </PageWrapper>
  );
};

export default CustomerSuccessPage;