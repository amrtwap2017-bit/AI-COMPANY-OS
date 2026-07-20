"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import {
  PageHeader, PageWrapper, DataTable, LoadingState,
  EmptyState, AlertBanner, Pagination,
} from "@/components/ui";
import { ActionBar } from "@/components/ui/ActionBar";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";
import { authFetch } from "@/lib/hooks/useAuthFetch";

export default function WarehousesPage() {
  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const r = await authFetch("/api/v1/inventory/warehouses/");
      if (!r.ok) return [];
      const d = await r.json();
      return Array.isArray(d) ? d : d?.items || d?.data || [];
    },
    staleTime: 60_000,
  });

  const { query, setQuery, filtered } = useSearch(data, ["name","code","location","address"]);
  const { page, totalPages, items, goToPage } = usePagination(filtered, 20);

  const columns = [
    { key: "name", label: "Warehouse", sortable: true,
      render: (row:any) => (
        <div>
          <p className="font-semibold text-sm text-slate-900">{row.name || row.code || "—"}</p>
          <p className="text-xs text-slate-400">{row.code || ""}</p>
        </div>
      )},
    { key: "location", label: "Location",
      render: (row:any) => <span className="text-sm text-slate-600">{row.location || row.address || "—"}</span> },
    { key: "capacity", label: "Capacity",
      render: (row:any) => <span className="text-sm text-slate-700">{row.capacity || "—"}</span> },
    { key: "item_count", label: "Items",
      render: (row:any) => (
        <span className="text-sm font-semibold text-slate-900">{row.item_count || row.items || 0}</span>
      )},
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Warehouses"
        subtitle={data.length + " warehouses configured"}
        badge="WH"
        actions={
          <button onClick={() => { refetch(); toast.success("Refreshed"); }}
            disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        } />

      {isError && <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed"} />}

      <ActionBar
        search={{ value: query, onChange: setQuery, placeholder: "Search warehouses..." }}
        resultCount={filtered.length} totalCount={data.length} />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading
          ? <LoadingState type="table" rows={5} />
          : items.length === 0
          ? <EmptyState icon="🏭" title="No warehouses" description="No warehouses configured" />
          : <DataTable columns={columns} data={items} />}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={goToPage} total={filtered.length} />
    </PageWrapper>
  );
}
