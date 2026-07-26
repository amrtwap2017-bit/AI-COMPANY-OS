// @ts-nocheck
"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
  Button,
} from "@/components/ui";


// Safe date formatter
const fmtDate = (d: any): string => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB"); }
  catch { return String(d).slice(0, 10); }
};

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchGoodsReceipts = async () => {
  const res = await authFetch(`/api/v1/supply-chain/goods-receipts`);
  if (!res.ok) {
    return [];
  }
  return res.json();
};

const fetchPurchaseOrders = async () => {
  const res = await authFetch(`/api/v1/purchase-orders/`);
  if (!res.ok) {
    return [];
  }
  return res.json();
};

const createGoodsReceipt = async (data) => {
  const response = await fetch(`${BACK}/api/v1/goods-receipts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!response.ok) {
    return [];
  }
  return res.json();
};

const GoodsReceiptsPage = () => {
  const { data: receipts, isLoading: isReceiptsLoading, isError: isReceiptsError } =
    useQuery(["goods-receipts"], fetchGoodsReceipts);
  const { data: purchaseOrders, isLoading: isPurchaseOrdersLoading, isError: isPurchaseOrdersError } =
    useQuery(["purchase-orders"], fetchPurchaseOrders);

  const createMutation = useMutation(createGoodsReceipt, {
    onSuccess: () => {
      toast.success("Receipt recorded successfully");
    },
  });

  if (isReceiptsLoading || isPurchaseOrdersLoading) return <LoadingState />;
  if (isReceiptsError || isPurchaseOrdersError) return <EmptyState />;

  const totalReceipts = receipts.length;
  const pendingDeliveriesCount = toArr(purchaseOrders).filter(
    (po) => ["approved", "sent", "ordered"].includes(po.status)
  ).length;
  const thisMonthReceipts = toArr(receipts).filter((grn: any) =>
    fmtDate(grn.received_date) ===
    new Date().toLocaleDateString("en-US", { month: "long" })
  );
  const totalPOValuePending = toArr(purchaseOrders).filter((po: any) => ["approved"].includes(po.status))
    .reduce((acc: any, po: any) => acc + po.total_amount, 0);

  return (
    <PageWrapper>
      <PageHeader title="Goods Receipts" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total Receipts", value: totalReceipts },
            { label: "Pending Deliveries", value: pendingDeliveriesCount },
            { label: "This Month", value: thisMonthReceipts.length },
            { label: "Total PO Value Pending", value: `EGP ${(Number(totalPOValuePending) || 0).toFixed(2)}` },
          ]}
        />
      </SectionCard>
      <SectionCard title="Pending Purchase Orders — Awaiting Delivery">
        {toArr(purchaseOrders).filter((po: any) => ["approved", "sent", "ordered"].includes(po.status))
          .map((po: any) => (
            <div key={po.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
              <strong>{po.po_number}</strong>
              <StatusBadge status={po.status} />
              <span>EGP {(Number(po.total_amount) || 0).toFixed(2)}</span>
              <Button
                onClick={() => {
                  // Show inline form with fields: received_by, notes, date (defaults today)
                }}
              >
                Mark as Received
              </Button>
            </div>
          ))}
      </SectionCard>
      <SectionCard title="Recent Goods Receipts">
        {receipts.length === 0 ? (
          <EmptyState message="No goods receipts recorded yet" />
        ) : (
          toArr(receipts).map((grn: any) => (
            <div key={grn.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
              <span>{grn.grn_number}</span>
              <span>{grn.po_id}</span>
              <span>{grn.received_by}</span>
              <span>{fmtDate(grn.received_date)}</span>
              <StatusBadge status={grn.status} />
            </div>
          ))
        )}
      </SectionCard>
      <SectionCard title="Quick Receive Form">
        {/* Standalone form to record receipt without PO */}
        {/* Fields: PO reference (text), Received By (text), Notes (textarea), Date (date input) */}
        {/* Submit: POST /api/v1/goods-receipts */}
        {/* Success toast: "Receipt recorded successfully" */}
      </SectionCard>
    </PageWrapper>
  );
};

export default GoodsReceiptsPage;