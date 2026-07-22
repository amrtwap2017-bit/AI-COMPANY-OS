"use client"; // @ts-nocheck

use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
  DataTable,
} from "@/components/ui";

const fetchVendors = async () => {
  try {
    const response = await fetch("/api/v1/supply-chain/vendors");
    if (!response.ok) throw new Error("Failed to fetch vendors");
    return response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const fetchPurchaseOrders = async () => {
  try {
    const response = await fetch("/api/v1/inventory/purchase-orders/");
    if (!response.ok) throw new Error("Failed to fetch purchase orders");
    return response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const fetchRFQs = async () => {
  try {
    const response = await fetch("/api/v1/supply-chain/rfqs");
    if (!response.ok) throw new Error("Failed to fetch RFQs");
    return response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const page = () => {
  const { data: vendors, isLoading: isVendorsLoading, isError: isVendorsError } =
    useQuery(["vendors"], fetchVendors);

  const { data: purchaseOrders, isLoading: isPurchaseOrdersLoading, isError: isPurchaseOrdersError } =
    useQuery(["purchaseOrders"], fetchPurchaseOrders);

  const { data: rfqs, isLoading: isRFQsLoading, isError: isRFQsError } = useQuery(["rfqs"], fetchRFQs);

  if (isVendorsLoading || isPurchaseOrdersLoading || isRFQsLoading) return <LoadingState />;

  if (isVendorsError || isPurchaseOrdersError || isRFQsError) return <EmptyState title="Failed to load data" />;

  const totalVendors = vendors.length;
  const activePOs = purchaseOrders.filter((po: any) => !["cancelled", "completed"].includes(po.status)).length;
  const pendingRFQs = rfqs.filter((rfq: any) => rfq.status === "sent").length;
  const avgLeadTime =
    vendors.reduce((acc, vendor: any) => acc + vendor.lead_time_days, 0) / vendors.length;

  const vendorPOCount = purchaseOrders.reduce(
    (acc, po: any) => {
      if (!acc[po.vendor_id]) acc[po.vendor_id] = 1;
      else acc[po.vendor_id]++;
      return acc;
    },
    {} as { [key: string]: number }
  );

  const topVendors = Object.entries(vendorPOCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const pendingRFQsWithoutResponse = rfqs
    .filter((rfq: any) => rfq.status === "sent" && Date.now() - new Date(rfq.created_at).getTime() > 5 * 24 * 60 * 60 * 1000)
    .map((rfq: any) => ({
      reference: rfq.id,
      createdDate: rfq.created_at,
      daysWaiting: Math.floor((Date.now() - new Date(rfq.created_at).getTime()) / (24 * 60 * 60 * 1000)),
    }));

  return (
    <PageWrapper>
      <PageHeader title="Supply Chain Analytics" />
      <SectionCard title="Metrics">
        <MetricStrip
          metrics={[
            { label: "Total Vendors", value: totalVendors },
            { label: "Active POs", value: activePOs },
            { label: "Pending RFQs", value: pendingRFQs },
            { label: "Avg Lead Time (days)", value: avgLeadTime.toFixed(2) },
          ]}
        />
      </SectionCard>
      <SectionCard title="Vendor Scorecard">
        <DataTable
          columns={[
            { header: "Vendor Name", accessorKey: "name" },
            { header: "Category", accessorKey: "category" },
            { header: "Lead Time (days)", accessorKey: "lead_time_days" },
            { header: "Payment Terms", accessorKey: "payment_terms" },
            {
              header: "Status",
              cell: ({ row }) => (
                <StatusBadge
                  status={purchaseOrders.some((po: any) => po.vendor_id === row.original.id && !["cancelled", "completed"].includes(po.status)) ? "active" : "inactive"}
                />
              ),
            },
          ]}
          data={vendors}
        />
      </SectionCard>
      <SectionCard title="Purchase Order Volume by Vendor">
        <div className="flex flex-col gap-2">
          {topVendors.map(([vendorId, count]) => (
            <div key={vendorId} className="flex items-center justify-between bg-blue-500 h-4 rounded px-2 text-white">
              {vendors.find((v: any) => v.id === vendorId)?.name}
              <div style={{ width: `${(count / Math.max(...Object.values(vendorPOCount))) * 100}%` }}></div>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Pending RFQs Without Response">
        {pendingRFQsWithoutResponse.length > 0 ? (
          <ul className="list-disc pl-4">
            {pendingRFQsWithoutResponse.map((rfq) => (
              <li key={rfq.reference}>
                {rfq.reference} - Created on {new Date(rfq.createdDate).toLocaleDateString()} ({rfq.daysWaiting} days waiting)
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="All RFQs responded" />
        )}
      </SectionCard>
    </PageWrapper>
  );
};

export default page;