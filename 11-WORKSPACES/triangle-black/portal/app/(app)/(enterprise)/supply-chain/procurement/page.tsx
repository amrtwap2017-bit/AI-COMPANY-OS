"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import Link from "next/link";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchPurchaseRequests = async () => {
  const response = await fetch(`${BACK}/api/v1/inventory/purchase-requests/`, { credentials: "include" });
  return response.json();
};

const fetchPurchaseOrders = async () => {
  const response = await fetch(`${BACK}/api/v1/inventory/purchase-orders/`, { credentials: "include" });
  return response.json();
};

const ProcurementPage = () => {
  const { data: purchaseRequests, isLoading: isPRLoading } = useQuery(["purchase-requests"], fetchPurchaseRequests, { refetchInterval: 120000 });
  const { data: purchaseOrders, isLoading: isPOLoading } = useQuery(["purchase-orders"], fetchPurchaseOrders, { refetchInterval: 120000 });

  if (isPRLoading || isPOLoading) return <LoadingState />;

  const draftPRs = purchaseRequests.filter(pr => pr.status === "draft").length;
  const approvedPRs = purchaseRequests.filter(pr => pr.status === "approved").length;
  const activePOs = purchaseOrders.filter(po => po.status === "active").length;
  const totalSpendEGP = (purchaseRequests.reduce((acc, pr) => acc + pr.amount, 0) + purchaseOrders.reduce((acc, po) => acc + po.amount, 0)).toFixed(2);

  return (
    <PageWrapper>
      <PageHeader title="Procurement Overview" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricStrip label="Draft PRs" value={draftPRs} />
        <MetricStrip label="Approved PRs" value={approvedPRs} />
        <MetricStrip label="Active POs" value={activePOs} />
        <MetricStrip label="Total Spend EGP" value={totalSpendEGP} />
      </div>
      <SectionCard title="Procurement Lifecycle Funnel">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Draft PRs</span>
          <span>→</span>
          <span>Approved PRs</span>
          <span>→</span>
          <span>POs Created</span>
          <span>→</span>
          <span>POs Received</span>
        </div>
      </SectionCard>
      <SectionCard title="Recent Activity">
        {purchaseRequests.slice(0, 5).concat(purchaseOrders.slice(0, 5)).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(item => (
          <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
            <span>{item.reference_number}</span>
            <StatusBadge type={item.type} />
            <StatusBadge status={item.status} />
            <span>{(Number(item.amount) || 0).toFixed(2)} EGP</span>
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
        ))}
      </SectionCard>
      <SectionCard title="Quick Actions">
        <Link href="/supply-chain/purchase-requests" className="block py-2 px-4 text-center bg-blue-500 text-white rounded hover:bg-blue-600">New PR</Link>
        <Link href="/supply-chain/queue" className="block py-2 px-4 text-center bg-green-500 text-white rounded hover:bg-green-600">View Queue</Link>
        <Link href="/supply-chain/vendors/analytics" className="block py-2 px-4 text-center bg-purple-500 text-white rounded hover:bg-purple-600">Check Vendors</Link>
      </SectionCard>
    </PageWrapper>
  );
};

export default ProcurementPage;