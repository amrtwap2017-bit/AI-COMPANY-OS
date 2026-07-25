// @ts-nocheck
"use client";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState } from "@/components/ui";
import Link from "next/link";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchPurchaseOrders = async () => {
  const response = await fetch(`${BACK}/api/v1/purchase-orders/`, { credentials: "include" });
  return response.json();
};

const fetchPurchaseRequests = async () => {
  const response = await fetch(`${BACK}/api/v1/purchase-requests/`, { credentials: "include" });
  return response.json();
};

const fetchSignalsSummary = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/signals/summary`, { credentials: "include" });
  return response.json();
};
// @ts-ignore

// @ts-ignore
export default function SupplyChainPage() {
  const { data: purchaseOrders, isLoading: isPurchaseOrdersLoading } = useQuery(["purchase-orders"], fetchPurchaseOrders, { refetchInterval: 120000 });
  const { data: purchaseRequests, isLoading: isPurchaseRequestsLoading } = useQuery(["purchase-requests"], fetchPurchaseRequests, { refetchInterval: 120000 });
  const { data: signalsSummary, isLoading: isSignalsSummaryLoading } = useQuery(["signals-summary"], fetchSignalsSummary, { refetchInterval: 120000 });

  if (isPurchaseOrdersLoading || isPurchaseRequestsLoading || isSignalsSummaryLoading) return <LoadingState />;

  const activePOs = (purchaseOrders || []).filter(po => po.status === "active").length;
  const pendingPRs = (purchaseRequests || []).filter(pr => pr.status === "pending").length;
  const openRFQs = signalsSummary.open_rfq_count;
  const inventoryAlerts = signalsSummary.inventory_alerts_count;

  return (
    <PageWrapper>
      <PageHeader title="Supply Chain Hub" />
      <MetricStrip
        metrics={[
          { label: "Active POs", value: activePOs },
          { label: "Pending PRs", value: pendingPRs },
          { label: "Open RFQs", value: openRFQs },
          { label: "Inventory Alerts", value: inventoryAlerts, status: inventoryAlerts > 0 ? <StatusBadge type="error" /> : null }
        ]}
      />
      <div className="grid grid-cols-3 gap-4">
        <Link href="/supply-chain/workbench" passHref>
          <SectionCard title="Workbench" subtitle="Overview of all activities" count={activePOs + pendingPRs} />
        </Link>
        <Link href="/supply-chain/purchase-requests" passHref>
          <SectionCard title="Purchase Requests" subtitle="Manage incoming requests" count={purchaseRequests.length} />
        </Link>
        <Link href="/supply-chain/purchase-orders" passHref>
          <SectionCard title="Purchase Orders" subtitle="Track all orders" count={purchaseOrders.length} />
        </Link>
        <Link href="/supply-chain/inventory" passHref>
          <SectionCard title="Inventory" subtitle="Manage stock levels" count={signalsSummary.total_inventory_count} />
        </Link>
        <Link href="/supply-chain/stock-balances" passHref>
          <SectionCard title="Stock Balances" subtitle="Check current balances" count={signalsSummary.stock_balance_count} />
        </Link>
        <Link href="/supply-chain/vendors" passHref>
          <SectionCard title="Vendors" subtitle="Manage vendor relationships" count={signalsSummary.vendor_count} />
        </Link>
        <Link href="/supply-chain/rfqs" passHref>
          <SectionCard title="RFQs" subtitle="Request for Quotations" count={openRFQs} />
        </Link>
        <Link href="/supply-chain/intelligence" passHref>
          <SectionCard title="Intelligence" subtitle="AI-driven insights" count={signalsSummary.ai_insight_count} />
        </Link>
        <Link href="/supply-chain/spend-analysis" passHref>
          <SectionCard title="Spend Analysis" subtitle="Analyze spending trends" count={signalsSummary.spend_analysis_count} />
        </Link>
      </div>
    </PageWrapper>
  );
}