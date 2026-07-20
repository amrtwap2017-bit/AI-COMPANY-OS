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
import { serviceRequestsApi, type ServiceRequest } from "@/lib";
import { fmtDate } from "@/lib/design-tokens";
import { RefreshCw } from "lucide-react";

const STATUS_FILTERS = ["all", "new", "assigned", "in_progress", "resolved", "closed"] as const;

export default function ServiceRequestsPage() {
  const [status, setStatus] = useState<string>("all");

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["service-requests"],
    queryFn: () => serviceRequestsApi.list({ limit: 100 }),
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
      render: (row: ServiceRequest) => (
        <div className="font-semibold text-slate-900 text-sm max-w-[280px] truncate">{row.title}</div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: ServiceRequest) => <StatusPill status={row.status} />,
    },
    {
      key: "priority",
      label: "Priority",
      render: (row: ServiceRequest) => (
        <StatusPill status={row.priority ?? row.urgency ?? "normal"} />
      ),
    },
    {
      key: "site",
      label: "Site",
      render: (row: ServiceRequest) => (
        <span className="text-sm text-slate-600">{row.site ?? row.site_id ?? "—"}</span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (row: ServiceRequest) => (
        <span className="text-xs text-slate-500">{fmtDate(row.created_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Service Requests"
        subtitle="Hotel engineering service request queue"
        badge="SR"
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
          title={error instanceof Error ? error.message : "Failed to load service requests"}
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
          <EmptyState title="No service requests" description="No requests match this filter." />
        ) : (
          <DataTable columns={columns} data={rows} />
        )}
      </div>
    </div>
  );
}
