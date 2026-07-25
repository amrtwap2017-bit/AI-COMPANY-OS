// @ts-nocheck
"use client";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

const workOrders: any[] = [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchContracts = async (customer_id: string) => {
  const response = await fetch(`${BACK}/api/v1/contracts?client_name=${customer_id}`, {
    credentials: "include",
  });
  return response.json();
};

const fetchWorkOrders = async (contract_ids: string[]) => {
  const response = await fetch(`${BACK}/api/v1/work-orders?contract_id=${contract_ids.join(",")}`, {
    credentials: "include",
  });
  return response.json();
};

const fetchInvoices = async (contract_ids: string[]) => {
  const response = await fetch(`${BACK}/api/v1/invoices?contract_id=${contract_ids.join(",")}`, {
    credentials: "include",
  });
  return response.json();
};

const Customer360Page = () => {
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams.get("q") || "");

  const { data: contracts, isLoading, isError } = useQuery({
    queryKey: ["contracts", searchText],
    queryFn: () => fetchContracts(searchText),
    enabled: !!searchText,
  });

  const contractIds = contracts?.map((contract: any) => contract.id) || [];

  const { data: workOrders, isFetchingWorkOrders } = useQuery({
    queryKey: ["work-orders", contractIds],
    queryFn: () => fetchWorkOrders(contractIds),
    enabled: !!contractIds.length,
  });

  const { data: invoices, isFetchingInvoices } = useQuery({
    queryKey: ["invoices", contractIds],
    queryFn: () => fetchInvoices(contractIds),
    enabled: !!contractIds.length,
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState />;

  return (
    <PageWrapper>
      {/* Render your page content here */}
    </PageWrapper>
  );
};

export default Customer360Page;