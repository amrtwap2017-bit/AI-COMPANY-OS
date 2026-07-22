"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";

const fetchRfqs = async () => {
  const response = await fetch("/api/v1/rfqs", { credentials: "include" });
  if (!response.ok) throw new Error("RFQs not found");
  return response.json();
};

const fetchVendors = async () => {
  const response = await fetch("/api/v1/inventory/vendors", { credentials: "include" });
  if (!response.ok) throw new Error("Vendors not found");
  return response.json();
};

const fetchPurchaseOrders = async () => {
  const response = await fetch("/api/v1/inventory/purchase-orders/", { credentials: "include" });
  if (!response.ok) throw new Error("Purchase orders not found");
  return response.json();
};

const ComparisonPage = () => {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);

  const { data: rfqData, isLoading: isRfqLoading, isError: isRfqError } = useQuery(["rfqs"], fetchRfqs, {
    refetchInterval: 300000,
  });

  const { data: vendorData, isLoading: isVendorLoading, isError: isVendorError } = useQuery(["vendors"], fetchVendors, {
    refetchInterval: 300000,
  });

  const { data: purchaseOrderData, isLoading: isPurchaseOrderLoading, isError: isPurchaseOrderError } = useQuery(
    ["purchaseOrders"],
    fetchPurchaseOrders,
    {
      refetchInterval: 300000,
    }
  );

  if (isRfqLoading || isVendorLoading || isPurchaseOrderLoading) return <LoadingState />;
  if (isRfqError || isVendorError || isPurchaseOrderError) return <EmptyState />;

  setRfqs(rfqData);
  setVendors(vendorData);
  setPurchaseOrders(purchaseOrderData);

  // Calculate metrics
  const totalVendors = vendors.length;
  const rfqsWithQuotes = rfqs.filter((rfq: any) => rfq.quotes.length > 0).length;

  // Find best value and fastest delivery vendors
  const bestValueVendor = vendors.sort((a, b) => a.quotes[0].price - b.quotes[0].price)[0];
  const fastestDeliveryVendor = vendors.sort((a, b) => a.quotes[0].lead_time_days - b.quotes[0].lead_time_days)[0];

  // Vendor comparison matrix
  const vendorMatrix = vendors.slice(0, 5).map((vendor: any) => {
    const poCount = purchaseOrders.filter((po: any) => po.vendor_id === vendor.id).length;
    const maxPoCount = Math.max(...vendors.map((v: any) => purchaseOrders.filter((po: any) => po.vendor_id === v.id).length));
    const score = ((1 / vendor.quotes[0].lead_time_days) * 40 + (poCount / maxPoCount) * 60);
    return { ...vendor, score };
  });

  // Recommended vendor
  const recommendedVendor = vendorMatrix.sort((a, b) => b.score - a.score)[0];

  return (
    <PageWrapper>
      <PageHeader title="Quote and Vendor Comparison" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Metrics">
          <MetricStrip label="Total Vendors" value={totalVendors} />
          <MetricStrip label="RFQs with Quotes" value={rfqsWithQuotes} />
          <MetricStrip label="Best Value Vendor" value={bestValueVendor.name}>
            <StatusBadge color="green">Lowest Price</StatusBadge>
          </MetricStrip>
          <MetricStrip label="Fastest Delivery Vendor" value={fastestDeliveryVendor.name}>
            <StatusBadge color="blue">Lowest Lead Time</StatusBadge>
          </MetricStrip>
        </SectionCard>
        <SectionCard title="Vendor Comparison Matrix">
          <table className="w-full">
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>Category</th>
                <th>Lead Time</th>
                <th>Payment Terms</th>
                <th>PO Count</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {vendorMatrix.map((vendor: any) => (
                <tr key={vendor.id} className={vendor.score === recommendedVendor.score ? "bg-green-100" : ""}>
                  <td>{vendor.name}</td>
                  <td>{vendor.category}</td>
                  <td>{vendor.quotes[0].lead_time_days} days</td>
                  <td>{vendor.payment_terms}</td>
                  <td>{purchaseOrders.filter((po: any) => po.vendor_id === vendor.id).length}</td>
                  <td>{vendor.score.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      </div>
      {rfqs.length > 0 ? (
        <SectionCard title="RFQ Comparison">
          {/* RFQ comparison logic here