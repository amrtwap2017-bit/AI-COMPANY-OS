// @ts-nocheck
"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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


const fetchVendor = async (id: string) => {
  const response = await fetch(`${BACK}/api/v1/inventory/vendors?id=${id}`, {
    credentials: "include",
  });
  if (!response.ok) return [];
  return response.json();
};

const fetchPurchaseOrders = async (vendor_id: string) => {
  const response = await fetch(`${BACK}/api/v1/inventory/purchase-orders?vendor_id=${vendor_id}`, {
    credentials: "include",
  });
  if (!response.ok) return [];
  return response.json();
};

const fetchRFQs = async (vendor_reference: string) => {
  const response = await fetch(`${BACK}/api/v1/rfqs?vendor_reference=${vendor_reference}`, {
    credentials: "include",
  });
  if (!response.ok) return [];
  return response.json();
};

const VendorPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const vendorQuery = useQuery({
    queryKey: ["vendor", id],
    queryFn: () => fetchVendor(id),
    enabled: !!id, // Ensure the query is only enabled if an ID is provided
  });

  const purchaseOrdersQuery = useQuery({
    queryKey: ["purchase-orders", id],
    queryFn: () => fetchPurchaseOrders(id),
    enabled: vendorQuery.isSuccess && !!id,
  });

  const rfqsQuery = useQuery({
    queryKey: ["rfqs", id],
    queryFn: () => fetchRFQs(vendorQuery.data?.reference || ""),
    enabled: purchaseOrdersQuery.isSuccess && !!id,
  });

  if (vendorQuery.isLoading) return <LoadingState />;
  if (vendorQuery.isError) return <EmptyState />;

  return (
    <PageWrapper>
      <PageHeader title="Vendor Details" />
      <SectionCard title="Vendor Information">
        {/* Render vendor details */}
      </SectionCard>
      <SectionCard title="Purchase Orders">
        {/* Render purchase orders */}
      </SectionCard>
      <SectionCard title="RFQs">
        {/* Render RFQs */}
      </SectionCard>
    </PageWrapper>
  );
};

export default VendorPage;