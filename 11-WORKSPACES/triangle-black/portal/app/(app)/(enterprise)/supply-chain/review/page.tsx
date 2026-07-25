// @ts-nocheck
"use client";

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
  const response = await fetch(`${BACK}/api/v1/inventory/purchase-orders`, {
    credentials: "include",
  });
  return response.json();
};

const fetchVendors = async () => {
  const response = await fetch(`${BACK}/api/v1/inventory/vendors`, {
    credentials: "include",
  });
  return response.json();
};

const fetchKpis = async () => {
  const response = await fetch(`${BACK}/api/v1/ai/analytics/kpis/live`, {
    credentials: "include",
  });
  return response.json();
};

const ReviewPage = () => {
  const { data: purchaseOrders, isLoading: isPOLoading } = useQuery(
    ["purchase-orders"],
    fetchPurchaseOrders,
    { refetchInterval: 300000 }
  );

  const { data: vendors, isLoading: isVendorLoading } = useQuery(
    ["vendors"],
    fetchVendors,
    { refetchInterval: 300000 }
  );

  const { data: kpis, isLoading: isKpiLoading } = useQuery(
    ["kpis"],
    fetchKpis,
    { refetchInterval: 300000 }
  );

  if (isPOLoading || isVendorLoading || isKpiLoading) {
    return <LoadingState />;
  }

  const totalPOs = purchaseOrders.length;
  const totalSpendEGP = (purchaseOrders || []).reduce(
    (acc, po) => acc + po.total_spend_egp,
    0
  );
  const activeVendors = new Set((purchaseOrders || []).map(po => po.vendor_id)).size;
  const avgLeadTime = (purchaseOrders || []).reduce(
    (acc, po) => acc + po.lead_time_days,
    0
  ) / totalPOs;

  let procurementHealthScore = 100;
  if (purchaseOrders.some(po => new Date(po.created_at) < new Date() - 30 * 24 * 60 * 60 * 1000)) {
    procurementHealthScore -= 10;
  }
  (purchaseOrders || []).forEach(po => {
    if (po.out_of_stock_signal) {
      procurementHealthScore -= 5;
    }
  });

  const vendorPerformance = (vendors || []).map(vendor => ({
    ...vendor,
    poCount: (purchaseOrders || []).filter(po => po.vendor_id === vendor.id).length,
  })).sort((a: any, b: any) => b.poCount - a.poCount).slice(0, 5);

  return (
    <PageWrapper>
      <PageHeader title="Supply Chain Periodic Review" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SectionCard title="Metrics">
          <MetricStrip label="Total POs" value={totalPOs} />
          <MetricStrip label="Total Spend EGP" value={totalSpendEGP} />
          <MetricStrip label="Active Vendors" value={activeVendors} />
          <MetricStrip label="Avg Lead Time" value={(Number(avgLeadTime) || 0).toFixed(2)} unit="days" />
        </SectionCard>
        <SectionCard title="Procurement Health Score">
          <div className="flex items-center justify-between">
            <span>Score: {procurementHealthScore}</span>
            <StatusBadge score={procurementHealthScore} />
          </div>
        </SectionCard>
        <SectionCard title="Vendor Performance">
          <ul>
            {vendorPerformance.map(vendor => (
              <li key={vendor.id}>
                {vendor.name}: {vendor.poCount}
                <div className="w-full bg-gray-200 rounded-full mt-1">
                  <div
                    className="bg-blue-500 text-white text-xs font-medium py-0.5 px-2 rounded-full"
                    style={{ width: `${(vendor.poCount / vendorPerformance[0].poCount) * 100}%` }}
                  >
                    {vendor.poCount}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </PageWrapper>
  );
};

export default ReviewPage;