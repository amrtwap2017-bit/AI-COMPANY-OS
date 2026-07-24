"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchStockBalances = async () => {
  const response = await fetch(`${BACK}/api/v1/stock-balances`, { credentials: "include" });
  if (!response.ok) return [];
  return response.json();
};

const fetchItems = async () => {
  const response = await fetch(`${BACK}/api/v1/inventory/items`, { credentials: "include" });
  if (!response.ok) return [];
  return response.json();
};

const fetchWarehouses = async () => {
  const response = await fetch(`${BACK}/api/v1/warehouses`, { credentials: "include" });
  if (!response.ok) return [];
  return response.json();
};

const StockBalancesPage = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);

  const { data: stockBalances, isLoading: isStockLoading } = useQuery(["stock-balances"], fetchStockBalances, { refetchInterval: 120000 });
  const { data: items, isLoading: isItemsLoading } = useQuery(["items"], fetchItems, { refetchInterval: 120000 });
  const { data: warehouses, isLoading: isWarehousesLoading } = useQuery(["warehouses"], fetchWarehouses, { refetchInterval: 120000 });

  if (isStockLoading || isItemsLoading || isWarehousesLoading) return <LoadingState />;

  if (!stockBalances || !items || !warehouses) return <EmptyState />;

  const filteredStockBalances = stockBalances.filter(sb => selectedWarehouse ? sb.warehouse_id === selectedWarehouse : true);

  const totalItems = (items || []).length;
  const totalValueEGP = stockBalances.reduce((acc: any, sb: any) => acc + sb.total_value, 0);
  const belowMinimum = stockBalances.filter(sb => sb.qty_on_hand < sb.min_stock).length;

  return (
    <PageWrapper>
      <PageHeader title="Stock Balances" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total Items", value: totalItems },
            { label: "Total Value EGP", value: (Number(totalValueEGP) || 0).toFixed(2) },
            { label: "Below Minimum", value: belowMinimum, color: "red" },
            { label: "Warehouses Count", value: warehouses.length }
          ]}
        />
      </SectionCard>
      <div className="flex gap-4">
        {warehouses.map(w => (
          <button
            key={w.id}
            onClick={() => setSelectedWarehouse(w.id)}
            className={`px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 ${
              selectedWarehouse === w.id ? "bg-blue-500 text-white" : ""
            }`}
          >
            {w.name}
          </button>
        ))}
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Category</th>
            <th>Qty On Hand</th>
            <th>Qty Reserved</th>
            <th>Qty Available</th>
            <th>Avg Cost EGP</th>
            <th>Total Value EGP</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredStockBalances.map(sb => {
            const item = (items || []).find(i => i.id === sb.item_id);
            if (!item) return null;
            return (
              <tr key={sb.id}>
                <td>{item.name}</td>
                <td className="px-2 py-1 rounded bg-gray-200">{item.category}</td>
                <td>{sb.qty_on_hand}</td>
                <td>{sb.qty_reserved}</td>
                <td>{sb.qty_available}</td>
                <td>{(Number(sb.avg_cost) || 0).toFixed(2)}</td>
                <td>{(Number(sb.total_value) || 0).toFixed(2)}</td>
                <td>
                  {sb.qty_on_hand === 0 ? (
                    <StatusBadge status="out_of_stock" />
                  ) : sb.qty_on_hand < item.min_stock ? (
                    <StatusBadge status="low" />
                  ) : (
                    <StatusBadge status="ok" />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </PageWrapper>
  );
};

export default StockBalancesPage;