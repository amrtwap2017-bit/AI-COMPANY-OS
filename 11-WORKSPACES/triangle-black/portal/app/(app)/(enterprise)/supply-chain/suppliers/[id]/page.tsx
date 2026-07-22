"use client"; // @ts-nocheck

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

const fetchVendor = async (id: string) => {
  const response = await fetch(`/api/v1/inventory/vendors?id=${id}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch vendor");
  return response.json();
};

const fetchPurchaseOrders = async (vendor_id: string) => {
  const response = await fetch(`/api/v1/inventory/purchase-orders?vendor_id=${vendor_id}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch purchase orders");
  return response.json();
};

const fetchRFQs = async (vendor_reference: string) => {
  const response = await fetch(`/api/v1/rfqs?vendor_reference=${vendor_reference}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch RFQs");
  return response.json();
};

const SupplierDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const { data: vendor, isLoading, isError } = useQuery(["vendor", id], () => fetchVendor(id), {
    refetchInterval: 300000,
  });

  if (isLoading) return <LoadingState />;
  if (isError || !vendor) return (
    <EmptyState>
      <Link href="/supply-chain/suppliers">Back to Suppliers</Link>
    </EmptyState>
  );

  const { name, category, phone, email, payment_terms } = vendor;
  const { total_POs, total_spend_EGP, lead_time_days } = vendor.metrics || {};
  const purchaseOrders = useQuery(["purchaseOrders", id], () => fetchPurchaseOrders(id), {
    refetchInterval: 300000,
  }).data || [];
  const rfqs = useQuery(["rfqs", vendor.vendor_reference], () => fetchRFQs(vendor.vendor_reference), {
    refetchInterval: 300000,
  }).data || [];

  const performanceBadge = purchaseOrders.length >= 3 ? "Good" : purchaseOrders.length > 0 ? "Developing" : "New";

  return (
    <PageWrapper>
      <PageHeader title={name} category={category}>
        <StatusBadge status={performanceBadge} />
      </PageHeader>
      <SectionCard title="Metrics">
        <MetricStrip
          metrics={[
            { label: "Total POs", value: total_POs },
            { label: "Total Spend EGP", value: total_spend_EGP },
            { label: "Lead Time (days)", value: lead_time_days },
            { label: "Payment Terms", value: payment_terms },
          ]}
        />
      </SectionCard>
      <SectionCard title="Contact Info">
        <div className="flex flex-col gap-2">
          <span>{phone}</span>
          <span>{email}</span>
          <span>{payment_terms}</span>
        </div>
      </SectionCard>
      <SectionCard title="Purchase Order History">
        {purchaseOrders.length === 0 ? (
          <EmptyState>No purchase orders found.</EmptyState>
        ) : (
          <ul className="list-disc pl-4">
            {purchaseOrders.map((po) => (
              <li key={po.po_number}>
                {po.po_number} - <StatusBadge status={po.status} /> - {po.total_amount_EGP} EGP - {po.created_at}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
      <Link href="/supply-chain/suppliers" className="mt-4 block text-center">
        Back to Suppliers
      </Link>
    </PageWrapper>
  );
};

export default SupplierDetailPage;