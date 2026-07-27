"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n: any) => { try { return `EGP ${Number(n||0)?.toLocaleString() || '0'}`; } catch { return "EGP 0"; } };
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchPurchaseOrders = async () => {
  const res = await authFetch(`/api/v1/inventory/purchase-orders`);
  return res.json();
};

const fetchVendors = async () => {
  const res = await authFetch(`/api/v1/inventory/vendors`);
  return res.json();
};

const SpendPage = () => {
  const [vendors, setVendors] = useState<{ id: number; name: string }[]>([]);
  const purchaseOrdersQuery = useQuery(["purchase-orders"], fetchPurchaseOrders, {
    refetchInterval: 300000,
  });
  const vendorsQuery = useQuery(["vendors"], fetchVendors, {
    onSuccess: (data) => setVendors(data),
  });

  if (purchaseOrdersQuery.isLoading || vendorsQuery.isLoading) return <LoadingState />;
  if (purchaseOrdersQuery.isError || vendorsQuery.isError) return <EmptyState />;

  const purchaseOrders = purchaseOrdersQuery.data;
  const totalPOs = purchaseOrders.length;
  const totalSpend = toArr(purchaseOrders).reduce((acc: any, po: any) => acc + po.total_amount, 0);
  const avgPOValue = totalPOs > 0 ? (totalSpend / (totalPOs || 1))?.toLocaleString() || '0' : "N/A";
  const activeVendors = new Set(toArr(purchaseOrders).map(po => po.vendor_id)).size;

  const statusCounts = toArr(purchaseOrders).reduce((acc: any, po: any) => {
    acc[po.status] = (acc[po.status] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const vendorSpend = toArr(purchaseOrders).reduce((acc: any, po: any) => {
    const vendor = toArr(vendors).find(vendor => vendor.id === po.vendor_id);
    if (vendor) {
      acc[vendor.name] = (acc[vendor.name] || 0) + po.total_amount;
    }
    return acc;
  }, {} as { [key: string]: number });

  const topVendors = Object.entries(vendorSpend)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5);

  const monthlyTrend = toArr(purchaseOrders).reduce((acc: any, po: any) => {
    const month = new Date(po.created_at).toLocaleString("default", { month: "long" });
    acc[month] = (acc[month] || { count: 0, totalAmount: 0 });
    acc[month].count++;
    acc[month].totalAmount += po.total_amount;
    return acc;
  }, {} as { [key: string]: { count: number; totalAmount: number } });

  const maxSpend = Math.max(...Object.values(vendorSpend));

  return (
    <PageWrapper>
      <PageHeader title="Procurement Spend Analysis" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total POs", value: (Number(totalPOs) || 0)?.toLocaleString() || '0' },
            { label: "Total Spend EGP", value: (Number(totalSpend) || 0)?.toLocaleString() || '0' },
            { label: "Avg PO Value EGP", value: avgPOValue },
            { label: "Active Vendors", value: activeVendors.toString() },
          ]}
        />
      </SectionCard>
      <SectionCard title="Spend by Status">
        {/* Render status bars */}
      </SectionCard>
      <SectionCard title="Top Vendors by Spend">
        {/* Render top vendors table */}
      </SectionCard>
      <SectionCard title="Monthly Trend (Last 3 Months)">
        {/* Render monthly trend table */}
      </SectionCard>
    </PageWrapper>
  );
};

export default SpendPage;