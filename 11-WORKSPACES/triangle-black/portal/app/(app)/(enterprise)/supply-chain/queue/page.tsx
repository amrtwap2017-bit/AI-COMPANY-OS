"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import { useState } from "react";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchPurchaseRequests = async () => {
  const response = await fetch(`${BACK}/api/v1/purchase-requests/`, { credentials: "include" });
  return response.json();
};

const fetchPurchaseOrders = async () => {
  const response = await fetch(`${BACK}/api/v1/purchase-orders/`, { credentials: "include" });
  return response.json();
};

const fetchRFQs = async () => {
  const response = await fetch(`${BACK}/api/v1/rfqs`, { credentials: "include" });
  return response.json();
};

const QueuePage = () => {
  const [totalQueueItems, setTotalQueueItems] = useState(0);

  const { data: purchaseRequests, isLoading: prLoading } = useQuery(["purchase-requests"], fetchPurchaseRequests, {
    refetchInterval: 60000,
  });

  const { data: purchaseOrders, isLoading: poLoading } = useQuery(["purchase-orders"], fetchPurchaseOrders, {
    refetchInterval: 60000,
  });

  const { data: rfqs, isLoading: rfqLoading } = useQuery(["rfqs"], fetchRFQs, {
    refetchInterval: 60000,
  });

  if (prLoading || poLoading || rfqLoading) return <LoadingState />;

  const urgentPRs = (purchaseRequests || []).filter((pr: any) => pr.urgency === "urgent").sort((a: any, b: any) => new Date(b.created_at) - new Date(a.created_at));
  const pendingPOs = (purchaseOrders || []).filter((po: any) => ["pending", "approved"].includes(po.status)).sort((a: any, b: any) => new Date(b.expected_delivery) - new Date(a.expected_delivery));
  const awaitingQuotes = (rfqs || []).filter((rfq: any) => rfq.status === "sent").sort((a: any, b: any) => new Date(b.created_at) - new Date(a.created_at));

  setTotalQueueItems(urgentPRs.length + pendingPOs.length + awaitingQuotes.length);

  return (
    <PageWrapper>
      <PageHeader title="Procurement Queue" badge={<StatusBadge type="info">{totalQueueItems}</StatusBadge>} />
      <MetricStrip
        items={[
          { label: "PRs Pending", value: (purchaseRequests || []).filter((pr: any) => ["draft", "pending"].includes(pr.status)).length, color: "primary" },
          { label: "POs Active", value: (purchaseOrders || []).filter((po: any) => !["received", "cancelled"].includes(po.status)).length, color: "success" },
          { label: "Open RFQs", value: (rfqs || []).filter((rfq: any) => rfq.status === "sent").length, color: "warning" },
          { label: "Total Queue Items", value: totalQueueItems, color: "info" },
        ]}
      />
      <SectionCard title="Urgent PRs">
        {urgentPRs.length > 0 ? (
          urgentPRs.map((pr: any) => (
            <div key={pr.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
              <span>{pr.reference_number}</span>
              <StatusBadge type="primary">{pr.type}</StatusBadge>
              <StatusBadge type={pr.status === "pending" ? "warning" : pr.status === "draft" ? "info" : "success"}>{pr.status}</StatusBadge>
              <span>{new Date(pr.created_at).toLocaleString()}</span>
            </div>
          ))
        ) : (
          <EmptyState title="No Urgent PRs" />
        )}
      </SectionCard>
      <SectionCard title="Pending POs">
        {pendingPOs.length > 0 ? (
          pendingPOs.map((po: any) => (
            <div key={po.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
              <span>{po.reference_number}</span>
              <StatusBadge type="primary">{po.type}</StatusBadge>
              <StatusBadge type={po.status === "pending" ? "warning" : "success"}>{po.status}</StatusBadge>
              <span>{new Date(po.expected_delivery).toLocaleString()}</span>
            </div>
          ))
        ) : (
          <EmptyState title="No Pending POs" />
        )}
      </SectionCard>
      <SectionCard title="Awaiting Quotes">
        {awaitingQuotes.length > 0 ? (
          awaitingQuotes.map((rfq: any) => (
            <div key={rfq.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
              <span>{rfq.reference_number}</span>
              <StatusBadge type="primary">{rfq.type}</StatusBadge>
              <StatusBadge type="warning">{rfq.status}</StatusBadge>
              <span>{new Date(rfq.created_at).toLocaleString()}</span>
            </div>
          ))
        ) : (
          <EmptyState title="No Awaiting Quotes" />
        )}
      </SectionCard>
    </PageWrapper>
  );
};

export default QueuePage;