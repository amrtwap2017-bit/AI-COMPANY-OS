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
import { inventoryApi, type InventoryItem } from "@/lib";
import { fmtCurrency } from "@/lib/design-tokens";
import { RefreshCw } from "lucide-react";

export default function InventoryPage() {
  const [search, setSearch] = useState("");

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["inventory-items"],
    queryFn: () => inventoryApi.list({ limit: 200 }),
    staleTime: 30_000,
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.sku?.toLowerCase().includes(q) ||
        item.item_code?.toLowerCase().includes(q),
    );
  }, [data, search]);

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row: InventoryItem) => (
        <div className="font-semibold text-slate-900 text-sm">{row.name}</div>
      ),
    },
    {
      key: "sku",
      label: "SKU",
      render: (row: InventoryItem) => (
        <span className="font-mono text-xs text-amber-700 font-semibold">
          {row.sku ?? row.item_code}
        </span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (row: InventoryItem) => (
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
          {row.category || "General"}
        </span>
      ),
    },
    {
      key: "unit_price",
      label: "Unit Price",
      render: (row: InventoryItem) => (
        <span className="text-sm font-medium text-slate-900">
          {fmtCurrency(row.unit_price ?? row.standard_cost ?? 0)}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Active",
      render: (row: InventoryItem) => (
        <StatusPill status={row.is_active ? "active" : "inactive"} />
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb/>
      <PageHeader
        title="Inventory Items"
        subtitle="Spare parts and materials catalog"
        badge="INV"
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
          title={error instanceof Error ? error.message : "Failed to load inventory"}
        />
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <SearchInput
          placeholder="Search by name or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full lg:w-72"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <LoadingState type="table" rows={8} />
        ) : rows.length === 0 ? (
          <EmptyState title="No inventory items found" description="Try adjusting your search." />
        ) : (
          <DataTable columns={columns} data={rows} />
        )}
      </div>
    </div>
  );
}
