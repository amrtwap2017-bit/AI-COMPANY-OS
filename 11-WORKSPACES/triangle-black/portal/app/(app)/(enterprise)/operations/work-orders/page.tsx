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
  SearchInput,
} from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { workOrdersApi, techniciansApi, type WorkOrder } from "@/lib";
import { fmtDate } from "@/lib/design-tokens";
import { RefreshCw } from "lucide-react";

const STATUS_FILTERS = ["all", "open", "in_progress", "completed", "cancelled"] as const;

function shortId(id: string) {
  return id?.slice(0, 8) ?? "—";
}

export default function WorkOrdersPage() {
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  const {
    data: workOrders = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["work-orders", status],
    queryFn: () =>
      workOrdersApi.list({
        limit: 100,
        ...(status !== "all" ? { status } : {}),
      }),
    staleTime: 30_000,
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ["technicians-lookup"],
    queryFn: () => techniciansApi.list({ limit: 200 }),
    staleTime: 60_000,
  });

  const techName = useMemo(() => {
    const map = new Map<string, string>();
    technicians.forEach((t) => map.set(t.id, t.name));
    return map;
  }, [technicians]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return workOrders
      .map((wo) => ({
        ...wo,
        technician: wo.technician_id ? techName.get(wo.technician_id) ?? shortId(wo.technician_id) : "—",
        site: wo.site ?? wo.site_id ?? "—",
      }))
      .filter((wo) => {
        if (!q) return true;
        return (
          wo.title?.toLowerCase().includes(q) ||
          wo.id?.toLowerCase().includes(q) ||
          String(wo.technician).toLowerCase().includes(q)
        );
      });
  }, [workOrders, techName, search]);

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row: WorkOrder) => (
        <span className="font-mono text-xs text-amber-700 font-semibold">{shortId(row.id)}</span>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (row: WorkOrder) => (
        <div className="font-semibold text-slate-900 text-sm max-w-[280px] truncate">{row.title}</div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: WorkOrder) => <StatusPill status={row.status} />,
    },
    {
      key: "priority",
      label: "Priority",
      render: (row: WorkOrder) => <StatusPill status={row.priority} />,
    },
    {
      key: "technician",
      label: "Technician",
      render: (row: WorkOrder & { technician?: string }) => (
        <span className="text-sm text-slate-700">{row.technician ?? "—"}</span>
      ),
    },
    {
      key: "site",
      label: "Site",
      render: (row: WorkOrder & { site?: string }) => (
        <span className="text-sm text-slate-600">{row.site ?? "—"}</span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (row: WorkOrder) => (
        <span className="text-xs text-slate-500">{fmtDate(row.created_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb/>
      <PageHeader
        title="Work Orders"
        subtitle="Dispatch and track field work orders"
        badge="WO"
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
          title={error instanceof Error ? error.message : "Failed to load work orders"}
        />
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
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
        <SearchInput
          placeholder="Search work orders…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full lg:w-64"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <LoadingState type="table" rows={8} />
        ) : rows.length === 0 ? (
          <EmptyState title="No work orders" description="No work orders match this filter." />
        ) : (
          <DataTable columns={columns} data={rows} />
        )}
      </div>
    </div>
  );
}
