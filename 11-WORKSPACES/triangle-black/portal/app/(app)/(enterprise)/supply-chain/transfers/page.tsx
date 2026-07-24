"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";

const fetchTransfers = async () => {
  try {
    const response = await fetch("/api/v1/supply-chain/transfers", { credentials: "include" });
    if (!response.ok) throw new Error("Failed to fetch transfers");
    return response.json();
  } catch (error) {
    return fetch("/api/v1/inventory/transfers", { credentials: "include" }).then(response => response.json());
  }
};

const fetchWarehouses = async () => {
  const response = await fetch("/api/v1/supply-chain/warehouses", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch warehouses");
  return response.json();
};

const TransferPage = () => {
  const transfersQuery = useQuery(["transfers"], fetchTransfers, { refetchInterval: 120000 });
  const warehousesQuery = useQuery(["warehouses"], fetchWarehouses, { refetchInterval: 120000 });

  return (
    <PageWrapper>
      <PageHeader title="Inventory Transfers" />
      <div className="grid grid-cols-3 gap-4">
        <MetricStrip
          title="Total Transfers"
          value={transfersQuery.data ? transfersQuery.data.length : 0}
        />
        <MetricStrip
          title="Pending"
          value={transfersQuery.data ? transfersQuery.data.filter(t => t.status === "pending").length : 0}
        />
        <MetricStrip
          title="Completed"
          value={transfersQuery.data ? transfersQuery.data.filter(t => t.status === "completed").length : 0}
        />
        <MetricStrip
          title="Warehouses Count"
          value={warehousesQuery.data ? warehousesQuery.data.length : 0}
        />
      </div>
      <SectionCard title="Warehouses">
        {warehousesQuery.isLoading && <LoadingState />}
        {warehousesQuery.isError && <EmptyState message="Failed to fetch warehouses" />}
        {warehousesQuery.isSuccess && (
          <ul className="grid grid-cols-1 gap-4">
            {warehousesQuery.data.map(warehouse => (
              <li key={warehouse.id} className="bg-white p-4 rounded-lg shadow-md">
                <strong>{warehouse.name}</strong> - {warehouse.location}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
      <SectionCard title="Transfer History">
        {transfersQuery.isLoading && <LoadingState />}
        {transfersQuery.isError && (
          <EmptyState message="Failed to fetch transfers" note="Transfers are recorded when items move between warehouses" />
        )}
        {transfersQuery.isSuccess && transfersQuery.data.length === 0 && (
          <EmptyState message="No transfer records" note="Transfers are recorded when items move between warehouses" />
        )}
        {transfersQuery.isSuccess && transfersQuery.data.length > 0 && (
          <ul className="grid grid-cols-1 gap-4">
            {transfersQuery.data.map(transfer => (
              <li key={transfer.id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                <div>
                  From: {transfer.from_warehouse.name}, To: {transfer.to_warehouse.name}
                  <br />
                  Item: {transfer.item}, Quantity: {transfer.quantity}
                </div>
                <StatusBadge status={transfer.status} />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </PageWrapper>
  );
};

export default TransferPage;