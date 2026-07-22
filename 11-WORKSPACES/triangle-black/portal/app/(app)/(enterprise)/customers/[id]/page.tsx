"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

const fetchContracts = async (name: string) => {
  const response = await fetch(`/api/v1/contracts?client_name=${encodeURIComponent(name)}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch contracts");
  return response.json();
};

const fetchInvoices = async (contractId: string) => {
  const response = await fetch(`/api/v1/invoices?contract_id=${encodeURIComponent(contractId)}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch invoices");
  return response.json();
};

const fetchWorkOrders = async (contractId: string) => {
  const response = await fetch(`/api/v1/work-orders?contract_id=${encodeURIComponent(contractId)}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch work orders");
  return response.json();
};

const CustomerProfilePage = ({ params }: { params: { id: string } }) => {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || params?.id;

  const { data: contracts, isLoading, isError } = useQuery(["contracts", name], () => fetchContracts(name), {
    refetchInterval: 300000,
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState title="Failed to load customer" description="Please try again later." />;

  if (!contracts || contracts.length === 0)
    return (
      <EmptyState
        title="Customer not found"
        description="No contracts found for this customer."
        action={<Link href="/customers">Back to customers</Link>}
      />
    );

  const contractCount = contracts.length;
  const activeContracts = contracts.filter(contract => contract.status === "active").length;
  const totalValueEGP = contracts.reduce((acc, contract) => acc + contract.value, 0);
  const workOrders = contracts.flatMap(contract => fetchWorkOrders(contract.id));
  const invoices = contracts.flatMap(contract => fetchInvoices(contract.id));

  return (
    <PageWrapper>
      <PageHeader title={name} description={`${contractCount} contracts`} />
      <MetricStrip
        metrics={[
          { label: "Active Contracts", value: activeContracts, color: "green" },
          { label: "Total Value EGP", value: totalValueEGP, color: "blue" },
          { label: "Work Orders", value: workOrders.length, color: "orange" },
          { label: "Invoices", value: invoices.length, color: "purple" },
        ]}
      />
      <SectionCard title="Contracts">
        <ul>
          {contracts.map(contract => (
            <li key={contract.id}>
              {contract.name} - {StatusBadge(status: contract.status)}
            </li>
          ))}
        </ul>
      </SectionCard>
      <Link href="/customers">Back to customers</Link>
    </PageWrapper>
  );
};

export default CustomerProfilePage;