"use client";
// @ts-nocheck
import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  PageHeader, PageWrapper, DataTable, LoadingState,
  EmptyState, AlertBanner, StatusBadge, Progress,
  Pagination, StatusFilterTabs,
} from "@/components/ui";
import { ActionBar } from "@/components/ui/ActionBar";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { fmtDate } from "@/lib/design-tokens";
import { RefreshCw, Plus, Wrench } from "lucide-react";
import { toast } from "@/lib/toast";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const STATUS_TABS = [
  { value: "all",         label: "All" },
  { value: "open",        label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed",   label: "Completed" },
  { value: "cancelled",   label: "Cancelled" },
];

const PRIORITY_BADGE: Record<string,string> = {
  critical:  "bg-red-100 text-red-700 border border-red-200",
  high:      "bg-orange-100 text-orange-700 border border-orange-200",
  medium:    "bg-blue-100 text-blue-700 border border-blue-200",
  low:       "bg-slate-100 text-slate-600 border border-slate-200",
};

export default function WorkOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [pageSize, setPageSize] = useState(20);

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["work-orders"],
    queryFn: async () => {
      const r = await authFetch("/api/v1/work-orders/");
      if (!r.ok) return [];
      const d = await r.json();
      return Array.isArray(d) ? d : d?.items || d?.data || [];
    },
    staleTime: 30_000,
  });

  const preFiltered = useMemo(() => {
    let r = data;
    if (statusFilter !== "all")   r = r.filter((w:any) => w.status === statusFilter);
    if (priorityFilter !== "all") r = r.filter((w:any) => w.priority === priorityFilter);
    return r;
  }, [data, statusFilter, priorityFilter]);

  const { query, setQuery, filtered } = useSearch(preFiltered, ["title","type","location","description"]);
  const { page, totalPages, items, goToPage } = usePagination(filtered, pageSize);

  const kpis = useMemo(() => ({
    total:      data.length,
    open:       data.filter((w:any) => w.status === "open").length,
    inProgress: data.filter((w:any) => w.status === "in_progress").length,
    critical:   data.filter((w:any) => w.priority === "critical" || w.priority === "emergency").length,
    completed:  data.filter((w:any) => w.status === "completed").length,
  }), [data]);

  const tabs = STATUS_TABS.map(t => ({
    ...t,
    count: t.value === "all" ? data.length : data.filter((w:any) => w.status === t.value).length,
  }));

  const columns = [
    { key: "title", label: "Work Order", sortable: true,
      render: (row:any) => (
        <div>
          <p className="font-semibold text-sm text-slate-900">{row.title}</p>
          <p className="text-xs text-slate-400 mt-0.5 capitalize">{row.type || row.category || "—"}</p>
        </div>
      )},
    { key: "priority", label: "Priority",
      render: (row:any) => (
        <span className={"text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize " + (PRIORITY_BADGE[row.priority] || PRIORITY_BADGE.low)}>
          {row.priority || "medium"}
        </span>
      )},
    { key: "status", label: "Status",
      render: (row:any) => <StatusBadge status={row.status || "open"} dot /> },
    { key: "location", label: "Location",
      render: (row:any) => (
        <span className="text-xs text-slate-500">{row.location || row.site || "—"}</span>
      )},
    { key: "created_at", label: "Created", sortable: true,
      render: (row:any) => (
        <span className="text-xs text-slate-400">{fmtDate(row.created_at)}</span>
      )},
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Work Orders"
        subtitle={kpis.total + " total work orders"}
        badge="WO"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => { refetch(); toast.success("Refreshed"); }}
              disabled={isFetching}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
              <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
            </button>
            <Link href="/operations/work-orders/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 transition-colors">
              <Plus className="w-4 h-4" /> New WO
            </Link>
          </div>
        } />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total",       value: kpis.total,      color: "bg-slate-50 border-slate-200",     val: "text-slate-900" },
          { label: "Open",        value: kpis.open,       color: "bg-blue-50 border-blue-100",       val: "text-blue-700" },
          { label: "In Progress", value: kpis.inProgress, color: "bg-indigo-50 border-indigo-100",   val: "text-indigo-700" },
          { label: "Critical",    value: kpis.critical,   color: kpis.critical > 0 ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-200", val: kpis.critical > 0 ? "text-red-700" : "text-slate-900" },
          { label: "Completed",   value: kpis.completed,  color: "bg-emerald-50 border-emerald-100", val: "text-emerald-700" },
        ].map(k => (
          <div key={k.label} className={"rounded-2xl border p-4 " + k.color}>
            <div className={"text-2xl font-bold " + k.val}>{k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {isError && <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed to load"} />}

      <div className="flex items-center gap-3 flex-wrap">
        <StatusFilterTabs tabs={tabs} active={statusFilter} onChange={(v) => { setStatusFilter(v); goToPage(1); }} />
        <div className="flex items-center gap-1 ml-auto">
          {["all","critical","high","medium","low"].map(p => (
            <button key={p} onClick={() => setPriorityFilter(p)}
              className={"px-2.5 py-1 rounded-lg text-xs font-semibold transition-all " + (priorityFilter === p ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-100")}>
              {p === "all" ? "Any Priority" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <ActionBar
        search={{ value: query, onChange: setQuery, placeholder: "Search work orders..." }}
        resultCount={filtered.length}
        totalCount={data.length} />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading
          ? <LoadingState type="table" rows={8} />
          : items.length === 0
          ? <EmptyState icon="🔧" title={query ? "No results" : "No work orders"}
              description={query ? "Try a different search" : "Create your first work order"}
              action={!query && <Link href="/operations/work-orders/new" className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700">Create WO</Link>}
            />
          : <DataTable columns={columns} data={items} />}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={goToPage}
        total={filtered.length} pageSize={pageSize}
        onPageSize={(s) => { setPageSize(s); goToPage(1); }} />
    </PageWrapper>
  );
}
