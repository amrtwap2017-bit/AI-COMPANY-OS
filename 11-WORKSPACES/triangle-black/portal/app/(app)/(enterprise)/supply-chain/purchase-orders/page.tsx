// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PageHeader,
  DataTable,
  StatusPill,
  LoadingState,
  EmptyState,
  AlertBanner,
} from "@/components/ui";
import { purchaseOrdersApi, vendorsApi, type PurchaseOrder } from "@/lib";
import { fmtCurrency, fmtDate } from "@/lib/design-tokens";
import { RefreshCw } from "lucide-react";

const STATUS_FILTERS = ["all", "draft", "pending", "approved", "ordered", "received", "cancelled"] as const;

export default function PurchaseOrdersPage() {
  const [status, setStatus] = useState("all");

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: () => purchaseOrdersApi.list({ limit: 100 }),
    staleTime: 30_000,
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors-lookup"],
    queryFn: () => vendorsApi.list({ limit: 200 }),
    staleTime: 60_000,
  });

  const vendorName = useMemo(() => {
    const map = new Map<string, string>();
    vendors.forEach((v) => map.set(v.id, v.name));
    return map;
  }, [vendors]);

  const rows = useMemo(() => {
    const mapped = data.map((po) => ({
      ...po,
      vendor: vendorName.get(po.vendor_id) ?? po.vendor ?? po.vendor_id ?? "—",
    }));
    if (status === "all") return mapped;
    return mapped.filter((r) => r.status === status);
  }, [data, vendorName, status]);

  const columns = [
    {
      key: "po_number",
      label: "PO Number",
      render: (row: PurchaseOrder) => (
        <span className="font-mono text-xs text-amber-700 font-semibold">{row.po_number}</span>
      ),
    },
    {
      key: "vendor",
      label: "Vendor",
      render: (row: PurchaseOrder & { vendor?: string }) => (
        <span className="text-sm font-semibold text-slate-900">{row.vendor ?? "—"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: PurchaseOrder) => <StatusPill status={row.status} />,
    },
    {
      key: "total_amount",
      label: "Total Amount",
      render: (row: PurchaseOrder) => (
        <span className="text-sm font-medium text-slate-900">{fmtCurrency(row.total_amount)}</span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (row: PurchaseOrder) => (
        <span className="text-xs text-slate-500">{fmtDate(row.created_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Purchase Orders"
        subtitle="Supply chain purchase order tracking"
        badge="PO"
        actions={
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      {isError && (
        <AlertBanner
          type="error"
          title={error instanceof Error ? error.message : "Failed to load purchase orders"}
        />
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                status === s
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <LoadingState type="table" rows={8} />
        ) : rows.length === 0 ? (
          <EmptyState title="No purchase orders found" description="No POs match this filter." />
        ) : (
          <DataTable columns={columns} data={rows} />
        )}
      </div>
    </div>
  );
}
