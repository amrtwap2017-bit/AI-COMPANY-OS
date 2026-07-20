"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PageHeader, PageWrapper, DataTable, LoadingState,
  EmptyState, AlertBanner, Pagination, StatusFilterTabs,
} from "@/components/ui";
import { ActionBar } from "@/components/ui/ActionBar";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { fmtDate, timeAgo } from "@/lib/design-tokens";
import { RefreshCw, Activity } from "lucide-react";
import { toast } from "@/lib/toast";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const TYPE_TABS = [
  { value: "all",       label: "All" },
  { value: "lead",      label: "Leads" },
  { value: "quote",     label: "Quotes" },
  { value: "contract",  label: "Contracts" },
  { value: "work_order",label: "Work Orders" },
];

const ACTIVITY_COLORS: Record<string, string> = {
  qualification:   "bg-blue-100 text-blue-700",
  assignment:      "bg-purple-100 text-purple-700",
  quote_generated: "bg-amber-100 text-amber-700",
  quote_approved:  "bg-emerald-100 text-emerald-700",
  quote_rejected:  "bg-red-100 text-red-700",
  note:            "bg-slate-100 text-slate-600",
  default:         "bg-slate-100 text-slate-600",
};

export default function AuditLogPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [pageSize, setPageSize]     = useState(25);

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["audit-log", typeFilter],
    queryFn: async () => {
      const q = typeFilter !== "all" ? "?entity_type=" + typeFilter : "";
      const r = await authFetch("/api/v1/activitys/" + q);
      if (!r.ok) return [];
      const d = await r.json();
      return Array.isArray(d) ? d : d?.items || [];
    },
    staleTime: 30_000,
  });

  const { query, setQuery, filtered } = useSearch(
    data, ["description", "activity_type", "user_name", "entity_type"]
  );
  const { page, totalPages, items, goToPage } = usePagination(filtered, pageSize);

  const tabs = TYPE_TABS.map(t => ({
    ...t,
    count: t.value === "all" ? data.length
           : data.filter((a: any) => (a.entity_type || "").includes(t.value)).length,
  }));

  const columns = [
    { key: "activity_type", label: "Action",
      render: (row: any) => (
        <span className={"text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize " +
          (ACTIVITY_COLORS[row.activity_type] || ACTIVITY_COLORS.default)}>
          {(row.activity_type || "activity").replace(/_/g, " ")}
        </span>
      )},
    { key: "description", label: "Description",
      render: (row: any) => (
        <p className="text-sm text-slate-700 truncate max-w-xs">
          {row.description || "—"}
        </p>
      )},
    { key: "entity_type", label: "Entity",
      render: (row: any) => (
        <span className="text-xs text-slate-500 capitalize">{row.entity_type || "—"}</span>
      )},
    { key: "user_name", label: "User",
      render: (row: any) => (
        <span className="text-xs text-slate-600">{row.user_name || row.agent_name || "System"}</span>
      )},
    { key: "created_at", label: "When", sortable: true,
      render: (row: any) => (
        <div>
          <p className="text-xs text-slate-500">{timeAgo(row.created_at)}</p>
          <p className="text-[10px] text-slate-300">{fmtDate(row.created_at)}</p>
        </div>
      )},
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Audit Log"
        subtitle={data.length + " activity records"}
        badge="AUDIT"
        actions={
          <button
            onClick={() => { refetch(); toast.success("Refreshed"); }}
            disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl"
          >
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        }
      />

      {isError && (
        <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed to load audit log"} />
      )}

      <StatusFilterTabs
        tabs={tabs}
        active={typeFilter}
        onChange={v => { setTypeFilter(v); goToPage(1); }}
      />

      <ActionBar
        search={{ value: query, onChange: setQuery, placeholder: "Search activity..." }}
        resultCount={filtered.length}
        totalCount={data.length}
      />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <LoadingState type="table" rows={8} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No audit records"
            description="Activity will appear here as users interact with the platform"
          />
        ) : (
          <DataTable columns={columns} data={items} />
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPage={goToPage}
        total={filtered.length}
        pageSize={pageSize}
        onPageSize={s => { setPageSize(s); goToPage(1); }}
      />
    </PageWrapper>
  );
}
