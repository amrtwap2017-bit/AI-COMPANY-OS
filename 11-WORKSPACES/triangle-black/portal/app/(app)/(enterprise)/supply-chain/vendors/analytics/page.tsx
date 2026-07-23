"use client"; // @ts-nocheck
// @ts-nocheck

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

const fetchVendors = async () => {
  const response = await fetch("/api/v1/inventory/vendors", { credentials: "include" });
  return response.json();
};

const fetchPurchaseOrders = async () => {
  const response = await fetch("/api/v1/inventory/purchase-orders/", { credentials: "include" });
  return response.json();
};

const fetchRFQs = async () => {
  const response = await fetch("/api/v1/rfqs", { credentials: "include" });
  return response.json();
};

const VendorScorecardPage = () => {
  const vendorsQuery = useQuery(["vendors"], fetchVendors, { refetchInterval: 300000 });
  const purchaseOrdersQuery = useQuery(["purchase-orders"], fetchPurchaseOrders, { refetchInterval: 300000 });
  const rfqsQuery = useQuery(["rfqs"], fetchRFQs, { refetchInterval: 300000 });

  if (vendorsQuery.isLoading || purchaseOrdersQuery.isLoading || rfqsQuery.isLoading) {
    return <LoadingState />;
  }

  if (vendorsQuery.isError || purchaseOrdersQuery.isError || rfqsQuery.isError) {
    return <EmptyState message="Failed to load data" />;
  }

  const vendors = vendorsQuery.data;
  const purchaseOrders = purchaseOrdersQuery.data;
  const rfqs = rfqsQuery.data;

  // Calculate vendor scores
  const vendorScores = vendors.map((vendor) => {
    const poCount = purchaseOrders.filter((po) => po.vendor_id === vendor.id).length;
    const totalSpend = purchaseOrders
      .filter((po) => po.vendor_id === vendor.id)
      .reduce((acc, po) => acc + po.total_amount, 0);
    const leadTime = vendor.lead_time_days || 1; // Avoid division by zero
    let performanceScore = poCount * 10 + (1 / leadTime) * 40 + 50;
    performanceScore = Math.min(Math.max(performanceScore, 0), 100);
    return { ...vendor, po_count: poCount, total_spend, performance_score: performanceScore };
  });

  // Sort vendors by score
  vendorScores.sort((a, b) => b.performance_score - a.performance_score);

  // Calculate spend distribution
  const totalSpend = vendorScores.reduce((acc, vendor) => acc + vendor.total_spend, 0);
  const spendDistribution = vendorScores.slice(0, 5).map((vendor) => ({
    name: vendor.name,
    value: (vendor.total_spend / totalSpend) * 100,
  }));

  // Calculate RFQ response rate
  const respondedRFQs = rfqs.filter((rfq) => rfq.status === "received").length;
  const responseRate = ((respondedRFQs / rfqs.length) * 100).toFixed(2);

  return (
    <PageWrapper>
      <PageHeader title="Supplier Performance Scorecard" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total Vendors", value: vendors.length },
            { label: "Active (with POs)", value: vendorScores.filter((v) => v.po_count > 0).length },
            { label: "Total Spend EGP", value: totalSpend.toFixed(2) },
            { label: "Avg Lead Time days", value: vendorScores.reduce((acc, v) => acc + v.lead_time_days, 0) / vendors.length },
          ]}
        />
      </SectionCard>
      <SectionCard title="Vendor Scorecard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendorScores.map((vendor) => (
            <div key={vendor.id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">{vendor.name}</h3>
              <StatusBadge status={vendor.performance_score > 70 ? "success" : vendor.performance_score > 50 ? "warning" : "error"} />
              <p>Category: {vendor.category}</p>
              <p>POs: {vendor.po_count}</p>
              <p>Total Spend EGP: {vendor.total_spend.toFixed(2)}</p>
              <p>Score: {vendor.performance_score.toFixed(0)}</p>
              <p>Lead Time: {vendor.lead_time_days} days</p>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Spend Distribution">
        <div className="flex flex-col items-center space-y-4">
          {spendDistribution.map((item) => (
            <div key={item.name} className="bg-white p-4 rounded-lg shadow-md w-full max-w-sm">
              <h3 className="text-xl font-bold">{item.name}</h3>
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  style={{ width: `${item.value}%`, backgroundColor: "blue" }}
                  className="h-full"
                />
              </div>
              <p>{item.value.toFixed(0)}%</p>
            </div>
          ))}
        </div>
      </SectionCard>