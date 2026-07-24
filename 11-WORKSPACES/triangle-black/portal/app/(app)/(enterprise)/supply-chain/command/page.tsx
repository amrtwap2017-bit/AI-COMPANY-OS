"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState } from "@/components/ui";
import Link from "next/link";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchInventorySignals = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/signals?category=inventory`, { credentials: "include" });
  return response.json();
};

const fetchPurchaseRequests = async () => {
  const response = await fetch(`${BACK}/api/v1/purchase-requests/`, { credentials: "include" });
  return response.json();
};

const fetchPurchaseOrders = async () => {
  const response = await fetch(`${BACK}/api/v1/purchase-orders/`, { credentials: "include" });
  return response.json();
};

const SupplyChainCommandPage = () => {
  const { data: signals, isLoading: signalsLoading } = useQuery(["inventorySignals"], fetchInventorySignals, { refetchInterval: 60000 });
  const { data: prs, isLoading: prsLoading } = useQuery(["purchaseRequests"], fetchPurchaseRequests, { refetchInterval: 120000 });
  const { data: pos, isLoading: posLoading } = useQuery(["purchaseOrders"], fetchPurchaseOrders, { refetchInterval: 120000 });

  if (signalsLoading || prsLoading || posLoading) return <LoadingState />;

  const status = (signals || []).length > 0 ? "AT RISK" : "NORMAL";
  const pendingPRs = prs.filter(pr => pr.status === "PENDING").length;
  const activePOs = pos.filter(po => po.status === "ACTIVE").length;
  const inventoryAlerts = (signals || []).filter(signal => signal.type === "INVENTORY_ALERT").length;
  const vendorsCount = 13;

  return (
    <PageWrapper>
      <PageHeader title="Supply Chain Command Center" />
      <div className="flex justify-between items-center mb-4">
        <StatusBadge status={status} />
        <MetricStrip
          metrics={[
            { label: "Pending PRs", value: pendingPRs },
            { label: "Active POs", value: activePOs },
            { label: "Inventory Alerts", value: inventoryAlerts },
            { label: "Vendors Count", value: vendorsCount }
          ]}
        />
      </div>
      <SectionCard title="Action Required">
        <ul className="list-disc pl-5">
          {(signals || []).map(signal => (
            <li key={signal.id}>{signal.description}</li>
          ))}
          {prs.filter(pr => pr.status === "PENDING").map(pr => (
            <li key={pr.id}>{pr.title}</li>
          ))}
        </ul>
      </SectionCard>
      <div className="grid grid-cols-3 gap-4">
        <Link href="/workbench" className="bg-white p-4 rounded-lg shadow hover:bg-gray-100">Workbench</Link>
        <Link href="/purchase-requests" className="bg-white p-4 rounded-lg shadow hover:bg-gray-100">Purchase Requests</Link>
        <Link href="/purchase-orders" className="bg-white p-4 rounded-lg shadow hover:bg-gray-100">Purchase Orders</Link>
        <Link href="/rfqs" className="bg-white p-4 rounded-lg shadow hover:bg-gray-100">RFQs</Link>
        <Link href="/vendors" className="bg-white p-4 rounded-lg shadow hover:bg-gray-100">Vendors</Link>
        <Link href="/stock-levels" className="bg-white p-4 rounded-lg shadow hover:bg-gray-100">Stock Levels</Link>
      </div>
      <SectionCard title="Recent Activity">
        {pos.slice(-5).map(po => (
          <div key={po.id} className="flex justify-between items-center mb-2">
            <span>{po.po_number}</span>
            <span>{po.status}</span>
            <span>{po.amount} EGP</span>
          </div>
        ))}
      </SectionCard>
    </PageWrapper>
  );
};

export default SupplyChainCommandPage;