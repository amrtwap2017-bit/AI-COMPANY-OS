"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
} from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchPurchaseOrders = async () => {
  const response = await fetch(`${BACK}/api/v1/inventory/purchase-orders`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch purchase orders");
  return response.json();
};

const fetchItems = async () => {
  const response = await fetch(`${BACK}/api/v1/inventory/items`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch items");
  return response.json();
};

const fetchStockBalances = async () => {
  const response = await fetch(`${BACK}/api/v1/supply-chain/stock-balances`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch stock balances");
  return response.json();
};

const fetchInventorySignals = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/signals?category=inventory`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch inventory signals");
  return response.json();
};

const RiskPage = () => {
  const { data: purchaseOrders, isLoading: isPurchaseOrdersLoading } = useQuery(["purchaseOrders"], fetchPurchaseOrders, { refetchInterval: 120000 });
  const { data: items, isLoading: isItemsLoading } = useQuery(["items"], fetchItems, { refetchInterval: 120000 });
  const { data: stockBalances, isLoading: isStockBalancesLoading } = useQuery(["stockBalances"], fetchStockBalances, { refetchInterval: 120000 });
  const { data: inventorySignals, isLoading: isInventorySignalsLoading } = useQuery(["inventorySignals"], fetchInventorySignals, { refetchInterval: 120000 });

  if (isPurchaseOrdersLoading || isItemsLoading || isStockBalancesLoading || isInventorySignalsLoading) return <LoadingState />;

  const stockBalancesWithItems = stockBalances.map((balance: any) => ({
    ...balance,
    item: (items || []).find((item: any) => item.item_id === balance.item_id),
  }));

  // Filter and group data for MetricStrip
  const highRiskItems = stockBalancesWithItems.filter((b: any) => b.qty_on_hand === 0);
  const mediumRiskItems = stockBalancesWithItems.filter((b: any) => b.qty_on_hand < b.min_stock);
  const overduePOs = purchaseOrders.filter((po: any) => new Date(po.expected_delivery) < new Date());
  const activeSignals = inventorySignals.filter((signal: any) => signal.status === "active");

  // Filter and group data for Risk Matrix
  const highRiskItemsForMatrix = stockBalancesWithItems.filter((b: any) => b.qty_on_hand === 0 || new Date(b.expected_delivery) < new Date());
  const mediumRiskItemsForMatrix = stockBalancesWithItems.filter(
    (b) => b.qty_on_hand < b.min_stock && new Date(b.expected_delivery) > new Date() && new Date(b.expected_delivery) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const lowRiskItemsForMatrix = stockBalancesWithItems.filter((b: any) => b.qty_on_hand >= b.reorder_point);

  return (
    <PageWrapper>
      <PageHeader title="Supply Chain Risk Assessment" />
      <div className="grid grid-cols-3 gap-4">
        <SectionCard title="High Risk Items">
          {highRiskItems.length > 0 ? (
            highRiskItems.map((item: any) => (
              <div key={item.item_id} className="p-2 border rounded-md">
                <h3>{item.item.name}</h3>
                <p>Reason: Out of stock</p>
                <p>Action: Reorder immediately</p>
              </div>
            ))
          ) : (
            <EmptyState message="No high risk items" />
          )}
        </SectionCard>
        {/* Similar sections for Medium Risk and Low Risk */}
      </div>
    </PageWrapper>
  );
};

export default RiskPage;