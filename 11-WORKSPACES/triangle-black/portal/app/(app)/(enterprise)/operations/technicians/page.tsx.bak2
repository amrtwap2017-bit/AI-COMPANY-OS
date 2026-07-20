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
import { techniciansApi, type Technician } from "@/lib";
import { RefreshCw } from "lucide-react";

export default function TechniciansPage() {
  const [search, setSearch] = useState("");

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["technicians"],
    queryFn: () => techniciansApi.list({ limit: 200 }),
    staleTime: 30_000,
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((t) => t.name?.toLowerCase().includes(q));
  }, [data, search]);

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row: Technician) => (
        <div className="font-semibold text-slate-900 text-sm">{row.name}</div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (row: Technician) => (
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
          {row.role ?? "Technician"}
        </span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (row: Technician) => (
        <span className="text-sm text-slate-600">{row.phone || "—"}</span>
      ),
    },
    {
      key: "is_active",
      label: "Active",
      render: (row: Technician) => (
        <StatusPill status={row.is_active ? "active" : "inactive"} />
      ),
    },
    {
      key: "current_assignments",
      label: "Current Assignments",
      render: (row: Technician) => (
        <span className="text-sm font-semibold text-slate-900">
          {row.current_assignments ?? row.current_work_orders ?? 0}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Technicians"
        subtitle="Field team roster and assignment load"
        badge="TECH"
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
          title={error instanceof Error ? error.message : "Failed to load technicians"}
        />
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <SearchInput
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full lg:w-72"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <LoadingState type="table" rows={8} />
        ) : rows.length === 0 ? (
          <EmptyState title="No technicians found" description="No technicians match this search." />
        ) : (
          <DataTable columns={columns} data={rows} />
        )}
      </div>
    </div>
  );
}
