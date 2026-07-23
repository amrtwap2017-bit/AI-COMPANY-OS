"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";;
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";

const fetchItems = async () => {
  const response = await fetch("/api/v1/inventory/items", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch items");
  return response.json();
};

const fetchStockBalances = async () => {
  try {
    const response = await fetch("/api/v1/supply-chain/stock-balances", { credentials: "include" });
    if (response.ok) return response.json();
  } catch (error) {}
  const response = await fetch("/api/v1/inventory/stock-balances", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch stock balances");
  return response.json();
};

const InventoryPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const itemsQuery = useQuery(["items"], fetchItems, { refetchInterval: 120000 });
  const stockBalancesQuery = useQuery(["stock-balances"], fetchStockBalances, { refetchInterval: 120000 });

  if (itemsQuery.isLoading || stockBalancesQuery.isLoading) return <LoadingState />;

  if (itemsQuery.isError || stockBalancesQuery.isError) return <EmptyState message="Failed to load data" />;

  const items = itemsQuery.data;
  const stockBalances = stockBalancesQuery.data;

  const totalItems = items.length;
  const lowStockCount = items.filter(item => stockBalances.find(balance => balance.item_id === item.id)?.qty_on_hand < item.min_stock).length;
  const outOfStockCount = items.filter(item => stockBalances.find(balance => balance.item_id === item.id)?.qty_on_hand === 0).length;
  const categoriesCount = new Set(items.map(item => item.category)).size;

  const filteredItems = selectedCategory ? items.filter(item => item.category === selectedCategory) : items;

  const reorderAlerts = items
    .filter(item => stockBalances.find(balance => balance.item_id === item.id)?.qty_on_hand < item.reorder_qty)
    .map(item => ({
      name: item.name,
      currentQty: stockBalances.find(balance => balance.item_id === item.id)?.qty_on_hand || 0,
      reorderQty: item.reorder_qty
    }));

  return (
    <PageWrapper>
      <PageHeader title="Inventory Management" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total Items", value: totalItems },
            { label: "Low Stock", value: lowStockCount, color: "amber" },
            { label: "Out of Stock", value: outOfStockCount, color: "red" },
            { label: "Categories", value: categoriesCount }
          ]}
        />
      </SectionCard>
      <div className="flex gap-4">
        {["All", "HVAC", "Electrical", "Plumbing", "Mechanical", "Chemicals"].map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category === "All" ? null : category)}
            className={`px-3 py-2 rounded-md ${
              selectedCategory === category || (selectedCategory === null && category === "All")
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <SectionCard title="Inventory Table">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Name</th>
              <th>Category</th>
              <th>Qty on Hand</th>
              <th>Min Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => {
              const balance = stockBalances.find(balance => balance.item_id === item.id);
              const status =
                balance?.qty_on_hand === 0
                  ? "out_of_stock"
                  : balance?.qty_on_hand < item.min_stock
                  ? "low_stock"
                  : "ok";
              return (
                <tr key={item.id}>
                  <td>{item.item_code}</td>
                  <td><strong>{item.name}</strong></td>
                  <td className="text-blue-500">{item.category}</td>
                  <td>{balance?.qty_on_hand || 0}</td>
                  <td>{item.min_stock}</td>
                  <td>
                    <StatusBadge status={status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SectionCard>
      <SectionCard title="Reorder Alerts">
        {reorderAlerts.length > 0 ? (
          <ul>
            {reorderAlerts.map(alert => (
              <li key={alert.name}>
                {alert.name} - Current Qty: {alert.currentQty}, Reorder Qty: {alert.reorderQty}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No reorder alerts" />
        )}
      </SectionCard>
    </PageWrapper>
  );
};

export default InventoryPage;