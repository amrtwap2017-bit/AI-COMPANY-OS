"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchRfqs = async () => {
  try {
    const response = await fetch(`${BACK}/api/v1/rfqs`, { credentials: "include" });
    if (!response.ok) throw new Error("Failed to fetch RFQs");
    return response.json();
  } catch (error) {
    console.error(error);
    return fetch(`${BACK}/api/v1/supply-chain/rfqs`, { credentials: "include" }).then(response => response.json());
  }
};

const fetchVendors = async () => {
  try {
    const response = await fetch(`${BACK}/api/v1/supply-chain/vendors`, { credentials: "include" });
    if (!response.ok) throw new Error("Failed to fetch vendors");
    return response.json();
  } catch (error) {
    console.error(error);
    return fetch(`${BACK}/api/v1/inventory/vendors`, { credentials: "include" }).then(response => response.json());
  }
};

const RFQsPage = () => {
  const [rfqs, setRfqs] = useState([]);
  const [vendors, setVendors] = useState([]);

  const rfqQuery = useQuery(["rfqs"], fetchRfqs, { refetchInterval: 120000 });
  const vendorQuery = useQuery(["vendors"], fetchVendors, { refetchInterval: 120000 });

  if (rfqQuery.isLoading || vendorQuery.isLoading) return <LoadingState />;
  if (rfqQuery.isError || vendorQuery.isError) return <EmptyState />;

  const openRfqs = rfqs.filter(rfq => rfq.status === "sent" || rfq.status === "open");
  const receivedQuotes = rfqs.filter(rfq => rfq.status === "received");
  const expiredRfqs = rfqs.filter(rfq => rfq.status === "expired");

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
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .concat(rfqs.filter(rfq => rfq.status !== "sent" && rfq.status !== "open"))
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
            {(vendors || []).slice(0, 8).map(vendor => (
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