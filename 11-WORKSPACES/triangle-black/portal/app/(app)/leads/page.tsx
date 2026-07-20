// @ts-nocheck

"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  PageHeader, DataTable, StatusPill, LoadingState,
  EmptyState, AlertBanner, SearchInput,
} from "@/components/ui"
import { PageWrapper } from "@/components/ui";
import { ActionBar } from "@/components/ui/ActionBar";
import { Pagination } from "@/components/ui/Pagination";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { leadsApi } from "@/lib/api";
import { fmtDate } from "@/lib/design-tokens";
import { RefreshCw, Plus, TrendingUp } from "lucide-react";

const STATUS_FILTERS = ["all", "new", "qualified", "negotiation", "won", "lost"] as const;

const STATUS_COLORS: Record<string, string> = {
  new:         "bg-purple-100 text-purple-700",
  qualified:   "bg-blue-100   text-blue-700",
  negotiation: "bg-amber-100  text-amber-700",
  won:         "bg-emerald-100 text-emerald-700",
  lost:        "bg-red-100    text-red-700",
};

export default function LeadsPage() {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["leads"],
    queryFn:  () => leadsApi.list({ limit: 200 }),
    staleTime: 30_000,
  });

  // Filter by status
  const statusFiltered = useMemo(() => {
    if (statusFilter === "all") return data;
    return data.filter((l: any) => l.status === statusFilter);
  }, [data, statusFilter]);

  // Search
  const { query, setQuery, filtered } = useSearch(
    statusFiltered,
    ["company_name", "contact_name", "email", "phone"]
  );

  // Paginate
  const { page, totalPages, items, goToPage } = usePagination(filtered, 20);

  // Table columns
  const columns = [
    {
      key: "company_name",
      label: "Company",
      render: (row: any) => (
        <div>
          <Link href={`/leads/${row.id}`}
            className="font-semibold text-slate-900 text-sm hover:text-amber-700 transition-colors">
            {row.company_name}
          </Link>
          <p className="text-xs text-slate-500 mt-0.5">{row.contact_name}</p>
        </div>
      ),
    },
    {
      key: "email",
      label: "Contact",
      render: (row: any) => (
        <div>
          <p className="text-sm text-slate-600">{row.email}</p>
          <p className="text-xs text-slate-400">{row.phone || "—"}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: any) => (
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize
          ${STATUS_COLORS[row.status] || "bg-slate-100 text-slate-700"}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: "source",
      label: "Source",
      render: (row: any) => (
        <span className="text-xs text-slate-500 capitalize">{row.source || "—"}</span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (row: any) => (
        <span className="text-xs text-slate-400">{fmtDate(row.created_at)}</span>
      ),
    },
  ];

  // KPI summary
  const kpis = useMemo(() => ({
    total:       data.length,
    new:         data.filter((l: any) => l.status === "new").length,
    qualified:   data.filter((l: any) => l.status === "qualified").length,
    negotiation: data.filter((l: any) => l.status === "negotiation").length,
    won:         data.filter((l: any) => l.status === "won").length,
  }), [data]);

  return (
    <PageWrapper>

      <PageHeader
        title="Leads"
        subtitle={`${kpis.total} total leads in pipeline`}
        badge="CRM"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} disabled={isFetching}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600
                hover:bg-slate-100 rounded-lg transition-colors">
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </button>
            <Link href="/leads/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white
                text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors">
              <Plus className="w-4 h-4" /> New Lead
            </Link>
          </div>
        }
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total",       value: kpis.total,       color: "slate" },
          { label: "New",         value: kpis.new,         color: "purple" },
          { label: "Qualified",   value: kpis.qualified,   color: "blue" },
          { label: "Negotiation", value: kpis.negotiation, color: "amber" },
          { label: "Won",         value: kpis.won,         color: "emerald" },
        ].map(k => (
          <button key={k.label}
            onClick={() => setStatusFilter(k.label === "Total" ? "all" : k.label.toLowerCase())}
            className="bg-white rounded-xl border border-slate-200 p-3 text-left
              hover:border-amber-300 transition-colors group"
          >
            <div className="text-2xl font-bold text-slate-900 group-hover:text-amber-700">{k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </button>
        ))}
      </div>

      {isError && <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed to load"} />}

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === s
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {s === "all" ? "All Leads" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Action bar */}
      <ActionBar
        search={{ value: query, onChange: setQuery, placeholder: "Search by company, contact, email..." }}
        export={{ data: filtered, filename: "leads", title: "Triangle Black Leads" }}
        resultCount={filtered.length}
        totalCount={data.length}
      />

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <LoadingState type="table" rows={8} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="📋"
            title={query ? "No results found" : "No leads yet"}
            description={query ? "Try a different search term" : "Add your first lead to get started"}
            action={!query && (
              <Link href="/leads/new"
                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700"
              >Add Lead</Link>
            )}
          />
        ) : (
          <DataTable columns={columns} data={items} />
        )}
      </div>

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPage={goToPage} />
    </PageWrapper>
  );
}
