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
import { fmtDate } from "@/lib/design-tokens";
import { RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const STATUS_TABS = [
  { value: "all",       label: "All" },
  { value: "open",      label: "Open" },
  { value: "in_progress",label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "converted", label: "Converted" },
];

export default function ServiceRequestsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(20);

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["service-requests", statusFilter],
    queryFn: async () => {
      const q = statusFilter !== "all" ? "?status=" + statusFilter : "";
      const r = await authFetch("/api/v1/service-requests/" + q);
      if (!r.ok) return [];
      const d = await r.json();
      return Array.isArray(d) ? d : d?.items || [];
    },
    staleTime: 30_000,
  });

  const { query, setQuery, filtered } = useSearch(data, ["title","description","priority"]);
  const { page, totalPages, items, goToPage } = usePagination(filtered, pageSize);
  const tabs = STATUS_TABS.map(t => ({ ...t, count: t.value === "all" ? data.length : data.filter((r:any) => r.status === t.value).length }));

  const columns = [
    { key: "title", label: "Request", sortable: true,
      render: (row:any) => (<div><p className="font-semibold text-sm text-slate-900">{row.title}</p><p className="text-xs text-slate-400">{row.description?.slice(0,60) || "—"}</p></div>) },
    { key: "priority", label: "Priority",
      render: (row:any) => <StatusBadge status={row.priority || "medium"} /> },
    { key: "status", label: "Status",
      render: (row:any) => <StatusBadge status={row.status || "open"} dot /> },
    { key: "created_at", label: "Created", sortable: true,
      render: (row:any) => <span className="text-xs text-slate-400">{fmtDate(row.created_at)}</span> },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Service Requests" subtitle={data.length + " service requests"} badge="SR"
        actions={<button onClick={() => { refetch(); toast.success("Refreshed"); }} disabled={isFetching} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl"><RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} /></button>} />

      {isError && <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed"} />}

      <StatusFilterTabs tabs={tabs} active={statusFilter} onChange={(v) => { setStatusFilter(v); goToPage(1); }} />

      <ActionBar search={{ value: query, onChange: setQuery, placeholder: "Search service requests..." }} resultCount={filtered.length} totalCount={data.length} />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? <LoadingState type="table" rows={6} /> :
         items.length === 0 ? <EmptyState icon="🔧" title="No service requests" description="No service requests found" /> :
         <DataTable columns={columns} data={items} />}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={goToPage} total={filtered.length} pageSize={pageSize} onPageSize={(s) => { setPageSize(s); goToPage(1); }} />
    </PageWrapper>
  );
}
