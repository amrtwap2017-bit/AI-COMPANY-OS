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
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { purchaseRequestsApi, type PurchaseRequest } from "@/lib";
import { fmtDate } from "@/lib/design-tokens";
import { RefreshCw } from "lucide-react";

const STATUS_FILTERS = [
  "all",
  "draft",
  "pending_approval",
  "approved",
  "po_created",
  "rejected",
] as const;

export default function PurchaseRequestsPage() {
  const [status, setStatus] = useState("all");

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["purchase-requests"],
    queryFn: () => purchaseRequestsApi.list({ limit: 100 }),
    staleTime: 30_000,
  });

  const rows = useMemo(() => {
    if (status === "all") return data;
    return data.filter((r) => r.status === status);
  }, [data, status]);

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (row: PurchaseRequest) => (
        <div>
          <div className="font-semibold text-slate-900 text-sm max-w-[240px] truncate">
            {row.title ?? row.pr_number}
          </div>
          <div className="text-xs text-slate-400 font-mono">{row.pr_number}</div>
        </div>
      ),
    },
    {
      key: "requested_by",
      label: "Requested By",
      render: (row: PurchaseRequest) => (
        <span className="text-sm text-slate-700">{row.requested_by ?? row.requester}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: PurchaseRequest) => <StatusPill status={row.status} />,
    },
    {
      key: "priority",
      label: "Priority",
      render: (row: PurchaseRequest) => (
        <StatusPill status={row.priority ?? row.urgency ?? "normal"} />
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (row: PurchaseRequest) => (
        <span className="text-xs text-slate-500">{fmtDate(row.created_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb/>
      <PageHeader
        title="Purchase Requests"
        subtitle="Procurement request intake and approval"
        badge="PR"
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
          title={error instanceof Error ? error.message : "Failed to load purchase requests"}
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
              {s === "all" ? "All" : s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <LoadingState type="table" rows={8} />
        ) : rows.length === 0 ? (
          <EmptyState title="No purchase requests found" description="No PRs match this filter." />
        ) : (
          <DataTable columns={columns} data={rows} />
        )}
      </div>
    </div>
  );
}
