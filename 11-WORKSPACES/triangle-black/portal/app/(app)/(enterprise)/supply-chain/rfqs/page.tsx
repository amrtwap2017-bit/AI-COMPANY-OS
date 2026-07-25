// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";


// Safe date formatter
const fmtDate = (d: any): string => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB"); }
  catch { return String(d).slice(0, 10); }
};

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchRfqs = async () => {
  try {
    const res = await authFetch(`/api/v1/rfqs`);
  if (!res.ok) return [];
  return res.json();
  } catch (error) {
    console.error(error);
    return authFetch(`/api/v1/rfqs`).then(response => response.json());
  }
};

const fetchVendors = async () => {
  try {
    const res = await authFetch(`/api/v1/inventory-vendors`);
  if (!res.ok) return [];
  return res.json();
  } catch (error) {
    console.error(error);
    return authFetch(`/api/v1/inventory/vendors`).then(response => response.json());
  }
};

const RFQsPage = () => {
  const [rfqs, setRfqs] = useState([]);
  const [vendors, setVendors] = useState([]);

  const rfqQuery = useQuery(["rfqs"], fetchRfqs, { refetchInterval: 120000 });
  const vendorQuery = useQuery(["vendors"], fetchVendors, { refetchInterval: 120000 });

  if (rfqQuery.isLoading || vendorQuery.isLoading) return <LoadingState />;
  if (rfqQuery.isError || vendorQuery.isError) return <EmptyState />;

  const openRfqs = toArr(rfqs).filter(rfq => rfq.status === "sent" || rfq.status === "open");
  const receivedQuotes = toArr(rfqs).filter(rfq => rfq.status === "received");
  const expiredRfqs = toArr(rfqs).filter(rfq => rfq.status === "expired");

  return (
    <PageWrapper>
      <PageHeader title="RFQ Management">
        <div className="flex items-center space-x-4">
          <MetricStrip label="Total RFQs" value={rfqs.length} />
          <MetricStrip label="Open" value={openRfqs.length} />
          <MetricStrip label="Received Quotes" value={receivedQuotes.length} />
          <MetricStrip label="Expired" value={expiredRfqs.length} />
        </div>
      </PageHeader>

      <SectionCard title="RFQ List">
        {rfqs.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-4">
            {openRfqs
              .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .concat(toArr(rfqs).filter(rfq => rfq.status !== "sent" && rfq.status !== "open"))
              .map(rfq => (
                <li key={rfq.id} className="flex items-center space-x-4">
                  <a href={`/supply-chain/rfqs/${rfq.id}`} className="font-bold">{rfq.rfq_number}</a>
                  <StatusBadge status={rfq.status} />
                  {rfq.vendor_count && <span>{rfq.vendor_count} vendors</span>}
                  <span className={`text-red-500 ${new Date(rfq.deadline) < new Date() ? "font-bold" : ""}`}>
                    Deadline: {rfq.deadline}
                  </span>
                  <span>Created: {rfq.created_at}</span>
                </li>
              ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Top Vendors">
        {(vendors || []).length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-4">
            {toArr(vendors).slice(0, 8).map(vendor => (
              <li key={vendor.id} className="flex items-center space-x-4">
                <span>{vendor.name}</span>
                <StatusBadge status={vendor.category} />
                <span>Lead Time: {vendor.lead_time_days} days</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <div className="text-center mt-8">
        <p>To create RFQ: go to Supply Chain Workbench → auto-PR</p>
      </div>
    </PageWrapper>
  );
};

export default RFQsPage;