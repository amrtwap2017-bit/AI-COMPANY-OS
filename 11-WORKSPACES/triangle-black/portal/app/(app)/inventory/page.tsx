"use client";
// @ts-nocheck
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PageHeader, PageWrapper, DataTable, LoadingState,
  EmptyState, AlertBanner, Pagination,
} from "@/components/ui";
import { ActionBar } from "@/components/ui/ActionBar";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "@/lib/toast";

export default function InventoryPage() {
  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const r = await fetch("/api/v1/inventory/items/", { cache: "no-store" });
      if (!r.ok) return [];
      const d = await r.json();
      return Array.isArray(d) ? d : d?.items || d?.data || [];
    },
    staleTime: 30_000,
  });

  const lowStock = useMemo(() => data.filter((i:any) => (i.quantity || 0) < (i.min_stock || 5)).length, [data]);
  const { query, setQuery, filtered } = useSearch(data, ["name","item_code","category","sku"]);
  const { page, totalPages, items, goToPage } = usePagination(filtered, 25);

  const columns = [
    { key: "name", label: "Item", sortable: true,
      render: (row:any) => (
        <div>
          <p className="font-semibold text-sm text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-400">{row.item_code || row.sku || "—"}</p>
        </div>
      )},
    { key: "category", label: "Category",
      render: (row:any) => (
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{row.category || "—"}</span>
      )},
    { key: "quantity", label: "Qty",
      render: (row:any) => {
        const qty = row.quantity || 0;
        const min = row.min_stock || 5;
        return (
          <span className={"text-sm font-bold " + (qty < min ? "text-red-600" : "text-emerald-600")}>
            {qty}
          </span>
        );
      }},
    { key: "unit_of_measure", label: "Unit",
      render: (row:any) => <span className="text-xs text-slate-500">{row.unit_of_measure || row.unit || "pc"}</span> },
    { key: "min_stock", label: "Min Stock",
      render: (row:any) => <span className="text-xs text-slate-400">{row.min_stock || 0}</span> },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Inventory"
        subtitle={data.length + " items tracked"}
        badge="INV"
        actions={
          <button onClick={() => { refetch(); toast.success("Refreshed"); }}
            disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        } />

      {lowStock > 0 && (
        <AlertBanner type="warning"
          title={lowStock + " item(s) below minimum stock level"}
          description="Review and create purchase requests for low stock items" />
      )}

      {isError && <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed"} />}

      <ActionBar
        search={{ value: query, onChange: setQuery, placeholder: "Search inventory..." }}
        resultCount={filtered.length} totalCount={data.length} />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading
          ? <LoadingState type="table" rows={8} />
          : items.length === 0
          ? <EmptyState icon="📦" title="No inventory" description="No inventory items found" />
          : <DataTable columns={columns} data={items} />}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={goToPage} total={filtered.length} />
    </PageWrapper>
  );
}
