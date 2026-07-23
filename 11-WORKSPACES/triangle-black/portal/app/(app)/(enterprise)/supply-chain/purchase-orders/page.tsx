"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";;
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

const fetchPurchaseOrders = async () => {
  const response = await fetch("/api/v1/inventory/purchase-orders/", {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch purchase orders");
  return response.json();
};

const PurchaseOrdersPage = () => {
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "pending" | "approved" | "received" | "cancelled">("all");

  const { data: purchaseOrders, isLoading, isError } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: fetchPurchaseOrders,
    refetchInterval: 120000,
  });

  if (isLoading) return <LoadingState />;
  if (isError || !purchaseOrders) return <EmptyState />;

  const totalPOs = purchaseOrders.length;
  const pendingPOs = purchaseOrders.filter(po => po.status === "pending" || po.status === "draft").length;
  const approvedPOs = purchaseOrders.filter(po => po.status === "approved").length;
  const receivedPOs = purchaseOrders.filter(po => po.status === "received").length;
  const cancelledPOs = purchaseOrders.filter(po => po.status === "cancelled").length;

  const totalValueEGP = purchaseOrders.reduce((acc, po) => acc + po.total_amount, 0).toLocaleString() + " EGP";

  const filteredPOs = statusFilter === "all"
    ? purchaseOrders
    : purchaseOrders.filter(po => po.status === statusFilter);

  return (
    <PageWrapper>
      <PageHeader title="Purchase Orders" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total POs", value: totalPOs },
            { label: "Pending", value: pendingPOs, color: "bg-yellow-200" },
            { label: "Approved", value: approvedPOs, color: "bg-green-200" },
            { label: "Received", value: receivedPOs, color: "bg-blue-200" },
            { label: "Cancelled", value: cancelledPOs, color: "bg-red-200" },
          ]}
        />
      </SectionCard>
      <div className="flex justify-center">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 mr-2 ${statusFilter === "all" ? "bg-blue-500 text-white" : "bg-gray-300"} rounded`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter("draft")}
          className={`px-4 py-2 mr-2 ${statusFilter === "draft" ? "bg-blue-500 text-white" : "bg-gray-300"} rounded`}
        >
          Draft
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`px-4 py-2 mr-2 ${statusFilter === "pending" ? "bg-blue-500 text-white" : "bg-gray-300"} rounded`}
        >
          Pending
        </button>
        <button
          onClick={() => setStatusFilter("approved")}
          className={`px-4 py-2 mr-2 ${statusFilter === "approved" ? "bg-blue-500 text-white" : "bg-gray-300"} rounded`}
        >
          Approved
        </button>
        <button
          onClick={() => setStatusFilter("received")}
          className={`px-4 py-2 mr-2 ${statusFilter === "received" ? "bg-blue-500 text-white" : "bg-gray-300"} rounded`}
        >
          Received
        </button>
        <button
          onClick={() => setStatusFilter("cancelled")}
          className={`px-4 py-2 ${statusFilter === "cancelled" ? "bg-blue-500 text-white" : "bg-gray-300"} rounded`}
        >
          Cancelled
        </button>
      </div>
      <SectionCard>
        {filteredPOs.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredPOs.map(po => (
              <li key={po.id} className="py-4">
                <div className="flex justify-between items-center">
                  <strong>{po.po_number}</strong>
                  <StatusBadge status={po.status} />
                </div>
                <div className="text-gray-500 text-sm">
                  {new Date(po.expected_delivery).toLocaleDateString()}{" "}
                  {new Date(po.expected_delivery) < new Date() && <span className="text-red-500">Past Due</span>}
                </div>
                <div className="text-gray-500 text-sm">{po.created_at.toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState />
        )}
      </SectionCard>
    </PageWrapper>
  );
};

export default PurchaseOrdersPage;