"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PageHeader, PageWrapper, DataTable, LoadingState,
  EmptyState, AlertBanner, StatusBadge, Pagination, StatusFilterTabs,
} from "@/components/ui";
import { ActionBar } from "@/components/ui/ActionBar";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { RefreshCw, Package } from "lucide-react";
import { toast } from "@/lib/toast";

const STATUS_TABS = [
  { value: "all",          label: "All" },
  { value: "operational",  label: "Operational" },
  { value: "maintenance",  label: "Maintenance" },
  { value: "offline",      label: "Offline" },
];

export default function AssetsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(20);

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const r = await fetch("/api/v1/assets/", { cache: "no-store" });
      if (!r.ok) return [];
      const d = await r.json();
      return Array.isArray(d) ? d : d?.items || [];
    },
    staleTime: 30_000,
  });

  const preFiltered = statusFilter === "all" ? data : data.filter((a:any) => a.status === statusFilter);
  const { query, setQuery, filtered } = useSearch(preFiltered, ["name","category","serial_number","location_description"]);
  const { page, totalPages, items, goToPage } = usePagination(filtered, pageSize);

  const tabs = STATUS_TABS.map(t => ({
    ...t,
    count: t.value === "all" ? data.length : data.filter((a:any) => a.status === t.value).length,
  }));

  const columns = [
    { key: "name", label: "Asset", sortable: true,
      render: (row:any) => (
        <div>
          <p className="font-semibold text-sm text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-400">{row.serial_number || "—"}</p>
        </div>
      )},
    { key: "category", label: "Category",
      render: (row:any) => (
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">
          {row.category || "—"}
        </span>
      )},
    { key: "location_description", label: "Location",
      render: (row:any) => <span className="text-sm text-slate-600">{row.location_description || "—"}</span> },
    { key: "status", label: "Status",
      render: (row:any) => <StatusBadge status={row.status || "operational"} dot /> },
    { key: "criticality", label: "Criticality",
      render: (row:any) => <StatusBadge status={row.criticality || "medium"} /> },
    { key: "manufacturer", label: "Manufacturer",
      render: (row:any) => <span className="text-xs text-slate-400">{row.manufacturer || "—"}</span> },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Assets"
        subtitle={data.length + " assets tracked"}
        badge="ASSET"
        actions={
          <button onClick={() => { refetch(); toast.success("Refreshed"); }}
            disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        } />

      {isError && <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed"} />}

      <StatusFilterTabs tabs={tabs} active={statusFilter} onChange={(v) => { setStatusFilter(v); goToPage(1); }} />

      <ActionBar
        search={{ value: query, onChange: setQuery, placeholder: "Search assets..." }}
        resultCount={filtered.length} totalCount={data.length} />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading
          ? <LoadingState type="table" rows={8} />
          : items.length === 0
          ? <EmptyState icon="📦" title="No assets" description="No assets found" />
          : <DataTable columns={columns} data={items} />}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={goToPage}
        total={filtered.length} pageSize={pageSize}
        onPageSize={(s) => { setPageSize(s); goToPage(1); }} />
    </PageWrapper>
  );
}
