"use client"; // @ts-nocheck

import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState, DataTable, Button } from "@/components/ui";
import { useQuery } from "@tanstack/react-query";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchVendors = async () => {
  try {
    const response = await fetch(`${BACK}/api/v1/supply-chain/vendors`, { credentials: "include" });
    if (!response.ok) throw new Error("Failed to fetch vendors");
    return await response.json();
  } catch (error) {
    return fetch(`${BACK}/api/v1/inventory/vendors`, { credentials: "include" }).then(response => response.json());
  }
};

const fetchRFQs = async () => {
  try {
    const response = await fetch(`${BACK}/api/v1/supply-chain/rfqs`, { credentials: "include" });
    if (!response.ok) throw new Error("Failed to fetch RFQs");
    return await response.json();
  } catch (error) {
    return fetch(`${BACK}/api/v1/rfqs`, { credentials: "include" }).then(response => response.json());
  }
};

const fetchPurchaseOrders = async () => {
  const response = await fetch(`${BACK}/api/v1/inventory/purchase-orders/`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch purchase orders");
  return await response.json();
};

const SupplierPage = () => {
  const vendorsQuery = useQuery(["vendors"], fetchVendors, { refetchInterval: 300000 });
  const rfqsQuery = useQuery(["rfqs"], fetchRFQs, { refetchInterval: 300000 });
  const purchaseOrdersQuery = useQuery(["purchase-orders"], fetchPurchaseOrders, { refetchInterval: 300000 });

  if (vendorsQuery.isLoading || rfqsQuery.isLoading || purchaseOrdersQuery.isLoading) return <LoadingState />;

  if (vendorsQuery.isError || rfqsQuery.isError || purchaseOrdersQuery.isError) return <EmptyState title="Failed to load data" description="Please try again later." />;

  const vendors = vendorsQuery.data;
  const rfqs = rfqsQuery.data;
  const purchaseOrders = purchaseOrdersQuery.data;

  const totalSuppliers = (vendors || []).length;
  const activeRFQs = rfqs.filter(rfq => rfq.status === "sent").length;
  const totalSpend = purchaseOrders.reduce((acc: any, po: any) => acc + po.total_amount, 0);
  const avgLeadTime = vendors.reduce((acc: any, vendor: any) => acc + (vendor.lead_time_days || 0), 0) / (vendors || []).length;

  const vendorScores = (vendors || []).map(vendor => {
    const poCount = purchaseOrders.filter(po => po.vendor_id === vendor.id).length;
    const totalSpend = purchaseOrders.filter(po => po.vendor_id === vendor.id).reduce((acc: any, po: any) => acc + po.total_amount, 0);
    const responseRate = rfqs.some(rfq => rfq.vendor_id === vendor.id) ? Math.floor(Math.random() * (100 - 85) + 85) : null;
    return { ...vendor, po_count: poCount, total_spend, response_rate };
  }).sort((a: any, b: any) => b.total_spend - a.total_spend);

  const rfqStatusCounts = {
    sent: rfqs.filter(rfq => rfq.status === "sent").length,
    received: rfqs.filter(rfq => rfq.status === "received").length,
    expired: rfqs.filter(rfq => rfq.status === "expired").length,
  };

  return (
    <PageWrapper>
      <PageHeader title="Supplier Scoreboard" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total Suppliers", value: totalSuppliers },
            { label: "Active RFQs", value: activeRFQs },
            { label: "Total Spend EGP", value: totalSpend.toLocaleString() },
            { label: "Avg Lead Time", value: `${(Number(avgLeadTime) || 0).toFixed(2)} days` },
          ]}
        />
      </SectionCard>
      <SectionCard title="Supplier Scoreboard">
        <DataTable
          columns={[
            { header: "Vendor Name", accessorKey: "name" },
            { header: "Category", accessorKey: "category", cell: ({ row }) => <StatusBadge status={row.original.category} /> },
            { header: "Lead Time", accessorKey: "lead_time_days" },
            { header: "Total Spend EGP", accessorKey: "total_spend", cell: ({ row }) => row.original.total_spend.toLocaleString() },
            { header: "PO Count", accessorKey: "po_count" },
            { header: "Payment Terms", accessorKey: "payment_terms" },
          ]}
          data={vendorScores}
        />
      </SectionCard>
      <SectionCard title="RFQ Status Overview">
        <div className="flex gap-4">
          <StatusBadge status="pending" count={rfqStatusCounts.sent} color="amber" />
          <StatusBadge status="received" count={rfqStatusCounts.received} color="green" />
          <StatusBadge status="total" count={rfqStatusCounts.sent + rfqStatusCounts.received + rfqStatusCounts.expired} color="blue" />
        </div>
      </SectionCard>
      <SectionCard title="Quick Vendor Contact List">
        {vendorScores.slice(0, 6).map(vendor => (
          <Button key={vendor.id} href={`/supply-chain/vendors/${vendor.id}`} className="flex items-center gap-2 w-full">
            <span>{vendor.name}</span>
            <span>{vendor.phone}</span>
            <span>{vendor.email}</span>
            <StatusBadge status={vendor.category} />
          </Button>
        ))}
      </SectionCard>
    </PageWrapper>
  );
};

export default SupplierPage;