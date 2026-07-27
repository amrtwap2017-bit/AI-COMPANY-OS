"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import Link from "next/link";


// Safe date formatter
const fmtDate = (d: any): string => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB"); }
  catch { return String(d).slice(0, 10); }
};

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchPurchaseRequests = async () => {
  const res = await authFetch(`/api/v1/purchase-requests/`);
  return res.json();
};

const fetchPurchaseOrders = async () => {
  const res = await authFetch(`/api/v1/purchase-orders/`);
  return res.json();
};

const ProcurementPage = () => {
  const { data: purchaseRequests, isLoading: isPRLoading } = useQuery(["purchase-requests"], fetchPurchaseRequests, { refetchInterval: 120000 });
  const { data: purchaseOrders, isLoading: isPOLoading } = useQuery(["purchase-orders"], fetchPurchaseOrders, { refetchInterval: 120000 });

  if (isPRLoading || isPOLoading) return <LoadingState />;

  const draftPRs = toArr(purchaseRequests).filter(pr => pr.status === "draft").length;
  const approvedPRs = toArr(purchaseRequests).filter(pr => pr.status === "approved").length;
  const activePOs = toArr(purchaseOrders).filter(po => po.status === "active").length;
  const totalSpendEGP = (toArr(purchaseRequests).reduce((acc: any, pr: any) => acc + pr.amount, 0) + toArr(purchaseOrders).reduce((acc: any, po: any) => acc + po.amount, 0)).toFixed(2);

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
        {toArr(purchaseRequests).slice(0, 5).concat(toArr(purchaseOrders).slice(0, 5)).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(item => (
          <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
            <span>{item.reference_number}</span>
            <StatusBadge type={item.type} />
            <StatusBadge status={item.status} />
            <span>{(Number(item.amount) || 0).toFixed(2)} EGP</span>
            <span>{fmtDate(item.created_at)}</span>
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