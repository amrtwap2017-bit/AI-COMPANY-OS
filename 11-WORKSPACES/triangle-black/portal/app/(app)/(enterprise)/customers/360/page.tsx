"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";;
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

const fetchContracts = async (customer_id: string) => {
  const response = await fetch(`/api/v1/contracts?client_name=${customer_id}`, {
    credentials: "include",
  });
  return response.json();
};

const fetchWorkOrders = async (contract_ids: string[]) => {
  const response = await fetch(`/api/v1/work-orders?contract_id=${contract_ids.join(",")}`, {
    credentials: "include",
  });
  return response.json();
};

const fetchInvoices = async (contract_ids: string[]) => {
  const response = await fetch(`/api/v1/invoices?contract_id=${contract_ids.join(",")}`, {
    credentials: "include",
  });
  return response.json();
};

const Customer360Page = () => {
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams.get("q") || "");

  const { data: contractsData, isLoading: contractsLoading } = useQuery(["contracts", searchText], () => fetchContracts(searchText), {
    refetchInterval: 300000,
  });

  const contractIds = contractsData?.map((contract: any) => contract.contract_id) || [];

  const { data: workOrdersData, isLoading: workOrdersLoading } = useQuery(["work-orders", contractIds], () => fetchWorkOrders(contractIds), {
    refetchInterval: 300000,
  });

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery(["invoices", contractIds], () => fetchInvoices(contractIds), {
    refetchInterval: 300000,
  });

  if (contractsLoading || workOrdersLoading || invoicesLoading) return <LoadingState />;

  if (!searchText && !contractIds.length) return <EmptyState message="Search for a customer above" />;

  const totalContracts = contractsData?.length || 0;
  const activeContracts = contractsData?.filter((contract: any) => contract.status === "active").length || 0;
  const totalWorkOrders = workOrdersData?.length || 0;
  const totalInvoices = invoicesData?.length || 0;
  const revenueEGP = invoicesData?.reduce((acc, invoice: any) => acc + invoice.total_amount, 0) || 0;

  return (
    <PageWrapper>
      <PageHeader title="Customer 360" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total Contracts", value: totalContracts },
            { label: "Active", value: activeContracts, badge: StatusBadge({ status: "active" }) },
            { label: "Total WOs", value: totalWorkOrders },
            { label: "Total Invoices", value: totalInvoices },
            { label: "Revenue EGP", value: revenueEGP.toFixed(2) },
          ]}
        />
      </SectionCard>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Search customer name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border p-2 rounded-md"
        />
        {contractsData && contractsData.length > 0 ? (
          <div>
            <h3>Contracts</h3>
            <ul>
              {contractsData.map((contract: any) => (
                <li key={contract.contract_id} className="flex justify-between items-center">
                  <span>{contract.client_name}</span>
                  <StatusBadge status={contract.status} />
                  <span>{contract.start_date} - {contract.end_date}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {workOrdersData && workOrdersData.length > 0 ? (
          <div>
            <h3>Work Orders</h3>
            <ul>
              {workOrdersData.map((wo: any) => (
                <li key={wo.work_order_id} className="flex justify-between items-center">
                  <span>{wo.title}</span>
                  <StatusBadge status={wo.status} />
                  <StatusBadge status={wo.priority} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {invoicesData && invoicesData.length > 0 ? (
          <div>
            <h3>Invoices</h3>
            <ul>
              {invoicesData.map((invoice: any) => (
                <li key={invoice.invoice_number} className="flex justify-between items-center">
                  <span>{invoice.invoice_number}</span>
                  <span>{invoice.total_amount.toFixed(2)}</span>
                  <StatusBadge status={invoice.status} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </PageWrapper>
  );
};

export default Customer360Page;