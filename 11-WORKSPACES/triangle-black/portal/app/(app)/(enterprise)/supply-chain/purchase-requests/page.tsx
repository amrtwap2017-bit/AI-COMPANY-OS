"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageWrapper, PageHeader, DataTable, LoadingState, EmptyState, AlertBanner, StatusBadge, Pagination, StatusFilterTabs } from "@/components/ui";
import { ActionBar } from "@/components/ui/ActionBar";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { fmtDate } from "@/lib/design-tokens";
import { RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";

const STATUS_TABS = [
  { value: "all",      label: "All" },
  { value: "draft",    label: "Draft" },
  { value: "pending",  label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function PurchaseRequestsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(20);

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["purchase-requests", statusFilter],
    queryFn: async () => {
      const res = await authFetch("/api/v1/inventory/purchase-requests");
      if (!res.ok) return [];
      const d = await res.json();
      return Array.isArray(d) ? d : d?.items || [];
    },
    staleTime: 30_000,
  });

  const filtered1 = statusFilter === "all" ? data : data.filter(r => r.status === statusFilter);
  const { query, setQuery, filtered } = useSearch(filtered1, ["pr_number","requester","department","justification"]);
  const { page, totalPages, items, goToPage } = usePagination(filtered, pageSize);

  const tabs = STATUS_TABS.map(t => ({
    ...t,
    count: t.value === "all" ? data.length : data.filter(r => r.status === t.value).length,
  }));

  const columns = [
    { key: "pr_number", label: "PR Number", sortable: true,
      render: (row) => <span className="font-mono text-xs font-semibold text-amber-700">{row.pr_number}</span> },
    { key: "requester", label: "Requester",
      render: (row) => (<div><p className="font-medium text-sm text-slate-900">{row.requester}</p><p className="text-xs text-slate-400">{row.department || "—"}</p></div>) },
    { key: "urgency", label: "Urgency",
      render: (row) => <StatusBadge status={row.urgency || "normal"} /> },
    { key: "status", label: "Status",
      render: (row) => <StatusBadge status={row.status} dot /> },
    { key: "total_amount", label: "Amount",
      render: (row) => <span className="text-sm font-semibold">{row.total_amount ? "EGP " + Number(row.total_amount).toLocaleString() : "—"}</span> },
    { key: "created_at", label: "Created", sortable: true,
      render: (row) => <span className="text-xs text-slate-400">{fmtDate(row.created_at)}</span> },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Purchase Requests" subtitle={data.length + " purchase requests"} badge="PR"
        actions={
          <button onClick={() => { refetch(); toast.success("Refreshed"); }} disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        } />

      {isError && <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed to load"} />}

      <StatusFilterTabs tabs={tabs} active={statusFilter} onChange={v => { setStatusFilter(v); goToPage(1); }} />

      <ActionBar search={{ value: query, onChange: setQuery, placeholder: "Search PRs..." }}
        resultCount={filtered.length} totalCount={data.length} />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? <LoadingState type="table" rows={6} /> :
         items.length === 0 ? <EmptyState icon="📋" title="No purchase requests" description="Purchase requests will appear here" /> :
         <DataTable columns={columns} data={items} />}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={goToPage}
        total={filtered.length} pageSize={pageSize} onPageSize={s => { setPageSize(s); goToPage(1); }} />
    </PageWrapper>
  );
}
