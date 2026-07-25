// @ts-nocheck
"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
} from "@/components/ui";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchContracts = async () => {
  const response = await fetch(`${BACK}/api/v1/contracts`, {
    credentials: "include",
  });
  return response.json();
};

const fetchWorkOrdersByContractId = async (contract_id: string) => {
  const response = await fetch(`${BACK}/api/v1/work-orders?contract_id=${contract_id}`, {
    credentials: "include",
  });
  return response.json();
};

const fetchInvoicesByContractId = async (contract_id: string) => {
  const response = await fetch(`${BACK}/api/v1/invoices?contract_id=${contract_id}`, {
    credentials: "include",
  });
  return response.json();
};

const Contract360Page = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedContract, setSelectedContract] = useState(null);

  const { data: contracts, isLoading, isError } = useQuery(
    ["contracts"],
    fetchContracts,
    {
      refetchInterval: 300000,
    }
  );

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState message="Failed to load contracts" />;

  const filteredContracts = (contracts || []).filter((contract: any) =>
    contract.client_name.toLowerCase().includes(searchText.toLowerCase())
  ).sort((a: any, b: any) => new Date(b.end_date) - new Date(a.end_date));

  const handleContractClick = (contract) => {
    setSelectedContract(contract);
  };

  return (
    <PageWrapper>
      <PageHeader title="Contract 360" />
      <input
        type="text"
        placeholder="Search by client name..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      {filteredContracts.length === 0 ? (
        <EmptyState message="No contracts found" />
      ) : (
        filteredContracts.map((contract: any) => (
          <SectionCard key={contract.id} onClick={() => handleContractClick(contract)}>
            <h3 className="font-bold">{contract.client_name}</h3>
            <StatusBadge status={contract.status} />
            <p>Value: {contract.contract_value} EGP</p>
            <p>Dates: {contract.start_date} - {contract.end_date}</p>
          </SectionCard>
        ))
      )}
      {selectedContract && (
        <div className="mt-8">
          <h2 className="font-bold">Selected Contract Details</h2>
          <p>Client: {selectedContract.client_name}</p>
          <p>Value: {selectedContract.contract_value} EGP</p>
          <p>Dates: {selectedContract.start_date} - {selectedContract.end_date}</p>
          <p>Status: {selectedContract.status}</p>
          <h3>Linked WOs</h3>
          <SectionCard>
            <MetricStrip
              title="WO Count"
              value={fetchWorkOrdersByContractId(selectedContract.id).length}
            />
          </SectionCard>
          <h3>Linked Invoices</h3>
          <SectionCard>
            <MetricStrip
              title="Invoice Total"
              value={fetchInvoicesByContractId(selectedContract.id).reduce(
                (total, invoice) => total + invoice.amount,
                0
              )}
            />
          </SectionCard>
        </div>
      )}
    </PageWrapper>
  );
};

export default Contract360Page;