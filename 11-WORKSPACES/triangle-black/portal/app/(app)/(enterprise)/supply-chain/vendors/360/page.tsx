"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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


const fetchVendors = async () => {
  const response = await fetch(`${BACK}/api/v1/inventory/vendors`, { credentials: "include" });
  if (!response.ok) return [];
  return response.json();
};

const Vendor360Page = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);

  const { data: vendors, isLoading, isError } = useQuery({
    queryKey: ["vendors"],
    queryFn: fetchVendors,
    refetchInterval: 300000,
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState title="Failed to load vendors" />;

  const filteredVendors = (vendors || []).filter((vendor: any) =>
    vendor.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
  };

  const renderVendorList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredVendors.map((vendor: any) => (
        <SectionCard key={vendor.id} onClick={() => handleVendorSelect(vendor)}>
          <h3 className="font-bold">{vendor.name}</h3>
          <StatusBadge>{vendor.category}</StatusBadge>
          <MetricStrip label="Lead Time" value={`${vendor.lead_time_days} days`} />
        </SectionCard>
      ))}
    </div>
  );

  const renderVendorDetail = () => {
    if (!selectedVendor) return null;

    const fetchPOs = async (vendorId) => {
      const response = await fetch(`${BACK}/api/v1/inventory/purchase-orders?vendor_id=${vendorId}`, { credentials: "include" });
      if (!response.ok) return [];
      return response.json();
    };

    const { data: purchaseOrders, isLoading: isPOLoading, isError: isPOError } = useQuery({
      queryKey: ["purchase-orders", selectedVendor.id],
      queryFn: () => fetchPOs(selectedVendor.id),
      refetchInterval: 300000,
    });

    if (isPOLoading) return <LoadingState />;
    if (isPOError) return <EmptyState title="Failed to load POs" />;

    const poCount = purchaseOrders.length;
    const totalSpend = (purchaseOrders || []).reduce((acc: any, po: any) => acc + po.total_spend_egp, 0);
    const lastPODate = purchaseOrders.length > 0 ? new Date(purchaseOrders[0].created_at).toLocaleDateString() : null;

    let performanceBadge = "No History";
    if (poCount >= 3) performanceBadge = "Good";
    else if (poCount >= 1 && poCount < 3) performanceBadge = "New";

    return (
      <div className="space-y-4">
        <h2>{selectedVendor.name}</h2>
        <p>Category: {selectedVendor.category}</p>
        <p>Phone: {selectedVendor.phone}</p>
        <p>Email: {selectedVendor.email}</p>
        <p>Payment Terms: {selectedVendor.payment_terms}</p>
        <p>Lead Time Days: {selectedVendor.lead_time_days}</p>

        <h3>PO History</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(purchaseOrders || []).map((po: any) => (
            <SectionCard key={po.id}>
              <h4>{po.order_number}</h4>
              <MetricStrip label="Total Spend" value={`${po.total_spend_egp} EGP`} />
              <MetricStrip label="Date" value={new Date(po.created_at).toLocaleDateString()} />
            </SectionCard>
          ))}
        </div>

        <div className="space-y-2">
          <h4>Performance</h4>
          <StatusBadge>{performanceBadge}</StatusBadge>
          <p>PO Count: {poCount}</p>
          <p>Total Spend EGP: {totalSpend} EGP</p>
          <p>Last PO Date: {lastPODate}</p>
        </div>
      </div>
    );
  };

  return (
    <PageWrapper>
      <PageHeader title="Vendor 360" />
      <input
        type="text"
        placeholder="Search vendors..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      {renderVendorList()}
      {renderVendorDetail()}
    </PageWrapper>
  );
};

export default Vendor360Page;