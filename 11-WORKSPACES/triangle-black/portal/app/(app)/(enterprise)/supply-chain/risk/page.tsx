"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

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

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchPurchaseOrders = async () => {
  const res = await authFetch(`/api/v1/inventory/purchase-orders`);
  if (!res.ok) return [];
  return res.json();
};

const fetchItems = async () => {
  const res = await authFetch(`/api/v1/inventory/items`);
  if (!res.ok) return [];
  return res.json();
};

const fetchStockBalances = async () => {
  const res = await authFetch(`/api/v1/stock-balances`);
  if (!res.ok) return [];
  return res.json();
};

const fetchInventorySignals = async () => {
  const res = await authFetch(`/api/v1/ai/signals?category=inventory`);
  if (!res.ok) return [];
  return res.json();
};

const RiskPage = () => {
  const { data: purchaseOrders, isLoading: isPurchaseOrdersLoading } = useQuery(["purchaseOrders"], fetchPurchaseOrders, { refetchInterval: 120000 });
  const { data: items, isLoading: isItemsLoading } = useQuery(["items"], fetchItems, { refetchInterval: 120000 });
  const { data: stockBalances, isLoading: isStockBalancesLoading } = useQuery(["stockBalances"], fetchStockBalances, { refetchInterval: 120000 });
  const { data: inventorySignals, isLoading: isInventorySignalsLoading } = useQuery(["inventorySignals"], fetchInventorySignals, { refetchInterval: 120000 });

  if (isPurchaseOrdersLoading || isItemsLoading || isStockBalancesLoading || isInventorySignalsLoading) return <LoadingState />;

  const stockBalancesWithItems = toArr(stockBalances).map((balance: any) => ({
    ...balance,
    item: toArr(items).find((item: any) => item.item_id === balance.item_id),
  }));

  // Filter and group data for MetricStrip
  const highRiskItems = toArr(stockBalancesWithItems).filter((b: any) => b.qty_on_hand === 0);
  const mediumRiskItems = toArr(stockBalancesWithItems).filter((b: any) => b.qty_on_hand < b.min_stock);
  const overduePOs = toArr(purchaseOrders).filter((po: any) => new Date(po.expected_delivery) < new Date());
  const activeSignals = toArr(inventorySignals).filter((signal: any) => signal.status === "active");

  // Filter and group data for Risk Matrix
  const highRiskItemsForMatrix = toArr(stockBalancesWithItems).filter((b: any) => b.qty_on_hand === 0 || new Date(b.expected_delivery) < new Date());
  const mediumRiskItemsForMatrix = toArr(stockBalancesWithItems).filter(
    (b) => b.qty_on_hand < b.min_stock && new Date(b.expected_delivery) > new Date() && new Date(b.expected_delivery) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const lowRiskItemsForMatrix = toArr(stockBalancesWithItems).filter((b: any) => b.qty_on_hand >= b.reorder_point);

  return (
    <PageWrapper>
      <PageHeader title="Supply Chain Risk Assessment" />
      <div className="grid grid-cols-3 gap-4">
        <SectionCard title="High Risk Items">
          {highRiskItems.length > 0 ? (
            toArr(highRiskItems).map((item: any) => (
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