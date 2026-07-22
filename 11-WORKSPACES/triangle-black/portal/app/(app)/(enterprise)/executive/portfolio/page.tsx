"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
  Progress,
} from "@/components/ui";

const fetchContracts = async () => {
  const response = await fetch("/api/v1/contracts", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch contracts");
  return response.json();
};

const fetchWorkOrders = async (contractId: string) => {
  const response = await fetch(`/api/v1/work-orders?contract_id=${contractId}`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch work orders");
  return response.json();
};

const fetchInvoices = async (contractId: string) => {
  const response = await fetch(`/api/v1/invoices?contract_id=${contractId}`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch invoices");
  return response.json();
};

const PortfolioPage = () => {
  const { data: contracts, isLoading, isError } = useQuery(["contracts"], fetchContracts, {
    refetchInterval: 300000,
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState message="Failed to load portfolio" />;

  const totalContracts = contracts.length;
  const activeContracts = contracts.filter((c) => c.status === "active").length;
  const totalValue = contracts.reduce((acc, c) => acc + c.contract_value, 0);
  const avgContractValue = totalContracts > 0 ? totalValue / totalContracts : 0;

  return (
    <PageWrapper>
      <PageHeader title="Executive Portfolio" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total Contracts", value: totalContracts },
            { label: "Active", value: activeContracts, color: "green" },
            { label: "Total Portfolio Value EGP", value: totalValue.toLocaleString("en-EG") },
            { label: "Avg Contract Value EGP", value: avgContractValue.toLocaleString("en-EG") },
          ]}
        />
      </SectionCard>
      <SectionCard title="Portfolio Health">
        <Progress
          value={(activeContracts / totalContracts) * 100}
          label={`Active Contracts (${activeContracts}/${totalContracts})`}
        />
        {/* Add amber alert for expiring contracts */}
      </SectionCard>
      <SectionCard title="Top 8 Contracts by Value">
        {contracts.slice(0, 8).map((contract) => (
          <div key={contract.id} className="flex items-center justify-between mb-2">
            <span className="font-bold">{contract.client_name}</span>
            <StatusBadge status={contract.status} />
            <span>{contract.contract_value.toLocaleString("en-EG")}</span>
            {/* Add WO count and end date with days remaining */}
          </div>
        ))}
      </SectionCard>
      <SectionCard title="Revenue Distribution by Status">
        {/* Add simple count + value per status group */}
      </SectionCard>
    </PageWrapper>
  );
};

export default PortfolioPage;