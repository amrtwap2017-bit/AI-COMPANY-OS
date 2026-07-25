// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

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

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchRfqs = async () => {
  const res = await authFetch(`/api/v1/rfqs`);
  if (!res.ok) return [];
  return res.json();
};

const fetchVendors = async () => {
  const res = await authFetch(`/api/v1/inventory/vendors`);
  if (!res.ok) return [];
  return res.json();
};

export default function RfqPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const { data: rfqs, isLoading, isError } = useQuery(["rfqs"], fetchRfqs, {
    refetchInterval: 120000,
  });

  const { data: vendors, isVendorsLoading, isVendorsError } = useQuery(
    ["vendors"],
    fetchVendors,
    {
      refetchInterval: 120000,
    }
  );

  if (isLoading || isVendorsLoading) return <LoadingState />;

  if (isError || isVendorsError) return <EmptyState message="Failed to load data" />;

  const rfq = toArr(rfqs).find((r: any) => r.id === id);

  if (!rfq) {
    return (
      <PageWrapper>
        <EmptyState
          message="RFQ not found"
          action={
            <Link href="/supply-chain/rfqs">
              <button className="btn btn-primary">Back to RFQs</button>
            </Link>
          }
        />
      </PageWrapper>
    );
  }

  const vendorNames = rfq.vendor_ids
    .map((vendorId: any) => toArr(vendors).find((v: any) => v.id === vendorId)?.name)
    .filter(Boolean);

  return (
    <PageWrapper>
      <PageHeader title={rfq.rfq_number}>
        <StatusBadge status={rfq.status} />
        <p className="text-sm text-gray-500">{new Date(rfq.created_at).toLocaleDateString()}</p>
      </PageHeader>
      <SectionCard title="Metrics">
        <MetricStrip
          metrics={[
            { label: "Lines Count", value: rfq.lines_count },
            { label: "Vendors Invited", value: rfq.vendor_ids.length },
            { label: "Quotes Received", value: rfq.quotes_received },
            { label: "Days Open", value: Math.floor((new Date() - new Date(rfq.created_at)) / (1000 * 60 * 60 * 24)) },
          ]}
        />
      </SectionCard>
      <SectionCard title="Details">
        <p>{rfq.description}</p>
        <p>Deadline: {new Date(rfq.deadline).toLocaleDateString()}</p>
        <p>Notes: {rfq.notes}</p>
      </SectionCard>
      <SectionCard title="Vendor Quotes">
        <ul className="list-disc pl-4">
          {toArr(vendorNames).map((name, index) => (
            <li key={index}>{name}</li>
          ))}
        </ul>
      </SectionCard>
      <Link href="/supply-chain/rfqs">
        <button className="btn btn-primary mt-4">Back to RFQs</button>
      </Link>
    </PageWrapper>
  );
}