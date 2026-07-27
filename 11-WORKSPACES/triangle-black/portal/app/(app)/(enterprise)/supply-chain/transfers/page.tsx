"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchTransfers = async () => {
  try {
    const res = await authFetch(`/api/v1/supply-chain/transfers`);
  if (!res.ok) return [];
  return res.json();
  } catch (error) {
    return authFetch(`/api/v1/inventory/transfers`).then(response => response.json());
  }
};

const fetchWarehouses = async () => {
  const res = await authFetch(`/api/v1/warehouses`);
  if (!res.ok) return [];
  return res.json();
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
          value={transfersQuery.data ? (transfersQuery.data || []).length : 0}
        />
        <MetricStrip
          title="Pending"
          value={transfersQuery.data ? (Array.isArray(transfersQuery.data) ? transfersQuery.data : []).filter(t => t.status === "pending").length : 0}
        />
        <MetricStrip
          title="Completed"
          value={transfersQuery.data ? (Array.isArray(transfersQuery.data) ? transfersQuery.data : []).filter(t => t.status === "completed").length : 0}
        />
        <MetricStrip
          title="Warehouses Count"
          value={warehousesQuery.data ? (warehousesQuery.data || []).length : 0}
        />
      </div>
      <SectionCard title="Warehouses">
        {warehousesQuery.isLoading && <LoadingState />}
        {warehousesQuery.isError && <EmptyState message="Failed to fetch warehouses" />}
        {warehousesQuery.isSuccess && (
          <ul className="grid grid-cols-1 gap-4">
            {(Array.isArray(warehousesQuery.data) ? warehousesQuery.data : []).map(warehouse => (
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
        {transfersQuery.isSuccess && (transfersQuery.data || []).length === 0 && (
          <EmptyState message="No transfer records" note="Transfers are recorded when items move between warehouses" />
        )}
        {transfersQuery.isSuccess && (transfersQuery.data || []).length > 0 && (
          <ul className="grid grid-cols-1 gap-4">
            {(Array.isArray(transfersQuery.data) ? transfersQuery.data : []).map(transfer => (
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