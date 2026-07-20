"use client";
// @ts-nocheck
import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  PageHeader, PageWrapper, DataTable, LoadingState,
  EmptyState, AlertBanner, StatusBadge, Avatar,
  Pagination, StatusFilterTabs,
} from "@/components/ui";
import { ActionBar } from "@/components/ui/ActionBar";
import { SearchInput } from "@/components/ui/SearchInput";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { leadsApi } from "@/lib/api/leads";
import { fmtDate } from "@/lib/design-tokens";
import { RefreshCw, Plus } from "lucide-react";
import { toast } from "@/lib/toast";

const STATUS_TABS = [
  { value: "all",         label: "All" },
  { value: "new",         label: "New" },
  { value: "qualified",   label: "Qualified" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won",         label: "Won" },
  { value: "lost",        label: "Lost" },
];

export default function LeadsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(20);

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["leads", statusFilter],
    queryFn: async () => {
      const r = await leadsApi.list({ limit: 200, status: statusFilter !== "all" ? statusFilter : undefined });
      return r.data || [];
    },
    staleTime: 30_000,
  });

  const { query, setQuery, filtered } = useSearch(data, ["company_name","contact_name","email","phone","name","company"]);
  const { page, totalPages, items, goToPage } = usePagination(filtered, pageSize);

  const tabs = STATUS_TABS.map(t => ({
    ...t,
    count: t.value === "all" ? data.length : data.filter((l:any) => l.status === t.value).length,
  }));

  const kpis = useMemo(() => ({
    total:       data.length,
    new:         data.filter((l:any) => l.status === "new").length,
    qualified:   data.filter((l:any) => l.status === "qualified").length,
    negotiation: data.filter((l:any) => l.status === "negotiation").length,
    won:         data.filter((l:any) => l.status === "won").length,
  }), [data]);

  const columns = [
    { key: "company_name", label: "Company", sortable: true,
      render: (row:any) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.company_name || row.company || row.name} size="sm" />
          <div>
            <Link href={"/leads/" + row.id}
              className="font-semibold text-sm text-slate-900 hover:text-amber-700 transition-colors">
              {row.company_name || row.company || "—"}
            </Link>
            <p className="text-xs text-slate-400 mt-0.5">{row.contact_name || row.name || ""}</p>
          </div>
        </div>
      )},
    { key: "email", label: "Contact",
      render: (row:any) => (
        <div>
          <p className="text-sm text-slate-700">{row.email || "—"}</p>
          <p className="text-xs text-slate-400">{row.phone || ""}</p>
        </div>
      )},
    { key: "status", label: "Status",
      render: (row:any) => <StatusBadge status={row.status} dot /> },
    { key: "source", label: "Source",
      render: (row:any) => (
        <span className="text-xs text-slate-500 capitalize">{row.source || "—"}</span>
      )},
    { key: "created_at", label: "Created", sortable: true,
      render: (row:any) => (
        <span className="text-xs text-slate-400">{fmtDate(row.created_at)}</span>
      )},
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Leads"
        subtitle={kpis.total + " leads in pipeline"}
        badge="CRM"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => { refetch(); toast.success("Refreshed"); }}
              disabled={isFetching}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Refresh leads">
              <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
            </button>
            <Link href="/leads/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 transition-colors">
              <Plus className="w-4 h-4" /> New Lead
            </Link>
          </div>
        } />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total",       value: kpis.total,       color: "bg-slate-50 border-slate-200", val: "text-slate-900" },
          { label: "New",         value: kpis.new,         color: "bg-purple-50 border-purple-100", val: "text-purple-700" },
          { label: "Qualified",   value: kpis.qualified,   color: "bg-blue-50 border-blue-100",   val: "text-blue-700" },
          { label: "Negotiation", value: kpis.negotiation, color: "bg-amber-50 border-amber-100", val: "text-amber-700" },
          { label: "Won",         value: kpis.won,         color: "bg-emerald-50 border-emerald-100", val: "text-emerald-700" },
        ].map(k => (
          <div key={k.label} className={"rounded-2xl border p-4 cursor-pointer hover:shadow-sm transition-all " + k.color}
            onClick={() => setStatusFilter(k.label === "Total" ? "all" : k.label.toLowerCase())}>
            <div className={"text-2xl font-bold " + k.val}>{k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {isError && <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed to load leads"} />}

      <StatusFilterTabs tabs={tabs} active={statusFilter} onChange={(v) => { setStatusFilter(v); goToPage(1); }} />

      <ActionBar
        search={{ value: query, onChange: setQuery, placeholder: "Search company, contact, email..." }}
        export={{ data: filtered, filename: "leads", title: "Triangle Black Leads" }}
        resultCount={filtered.length}
        totalCount={data.length} />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading
          ? <LoadingState type="table" rows={8} />
          : items.length === 0
          ? <EmptyState
              icon="📋"
              title={query ? "No results found" : "No leads yet"}
              description={query ? "Try a different search term" : "Add your first lead to get started"}
              action={!query && <Link href="/leads/new" className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700">Add Lead</Link>}
            />
          : <DataTable columns={columns} data={items} />}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPage={goToPage}
        total={filtered.length}
        pageSize={pageSize}
        onPageSize={(s) => { setPageSize(s); goToPage(1); }} />
    </PageWrapper>
  );
}
