// @ts-nocheck
"use client";

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
import { vendorsApi, type Vendor } from "@/lib";
import { RefreshCw } from "lucide-react";

export default function SuppliersPage() {
  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["suppliers-vendors"],
    queryFn: () => vendorsApi.list({ limit: 200 }),
    staleTime: 30_000,
  });

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row: Vendor) => (
        <div className="font-semibold text-slate-900 text-sm">{row.name}</div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (row: Vendor) => (
        <span className="text-sm text-slate-600">{row.email || "—"}</span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (row: Vendor) => (
        <span className="text-sm text-slate-600">{row.phone || "—"}</span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (row: Vendor) => (
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
          {row.category || "General"}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Active",
      render: (row: Vendor) => (
        <StatusPill status={row.is_active ? "active" : "inactive"} />
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb/>
      <PageHeader
        title="Suppliers & Vendors"
        subtitle="Registered inventory vendors"
        badge="SUP"
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
          title={error instanceof Error ? error.message : "Failed to load suppliers"}
        />
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <LoadingState type="table" rows={8} />
        ) : data.length === 0 ? (
          <EmptyState title="No suppliers found" description="No vendors registered yet." />
        ) : (
          <DataTable columns={columns} data={data} />
        )}
      </div>
    </div>
  );
}
