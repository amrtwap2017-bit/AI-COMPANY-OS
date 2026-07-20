"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PageHeader, PageWrapper, DataTable, LoadingState,
  EmptyState, StatusBadge, Avatar, Progress, Pagination, StatusFilterTabs,
} from "@/components/ui";
import { ActionBar } from "@/components/ui/ActionBar";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function OperationsTechniciansPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(20);

  const { data = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["ops-technicians"],
    queryFn: async () => {
      const r = await authFetch("/api/v1/technicians/");
      if (!r.ok) return [];
      const d = await r.json();
      return Array.isArray(d) ? d : d?.items || [];
    },
    staleTime: 30_000,
  });

  const preFiltered = statusFilter === "active" ? data.filter((t:any) => t.is_active) :
                      statusFilter === "inactive" ? data.filter((t:any) => !t.is_active) : data;
  const { query, setQuery, filtered } = useSearch(preFiltered, ["name","email","phone"]);
  const { page, totalPages, items, goToPage } = usePagination(filtered, pageSize);
  const active = data.filter((t:any) => t.is_active).length;
  const tabs = STATUS_TABS.map(t => ({ ...t, count: t.value === "all" ? data.length : t.value === "active" ? active : data.length - active }));

  const columns = [
    { key: "name", label: "Technician",
      render: (row:any) => (<div className="flex items-center gap-3"><Avatar name={row.name} size="sm" online={row.is_active} /><div><p className="font-semibold text-sm text-slate-900">{row.name}</p><p className="text-xs text-slate-400">{row.email || "—"}</p></div></div>) },
    { key: "specializations", label: "Specialization",
      render: (row:any) => <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{Array.isArray(row.specializations) ? row.specializations[0] : row.role || "Technician"}</span> },
    { key: "phone", label: "Phone", render: (row:any) => <span className="text-sm text-slate-600">{row.phone || "—"}</span> },
    { key: "is_active", label: "Status", render: (row:any) => <StatusBadge status={row.is_active ? "active" : "inactive"} dot /> },
    { key: "capacity", label: "Capacity",
      render: (row:any) => {
        const used = row.current_work_orders || 0; const max = row.max_work_orders || 10;
        const pct = Math.round((used / max) * 100);
        return (<div className="w-24"><div className="flex justify-between text-xs mb-1"><span className="text-slate-500">{used}/{max}</span><span className={pct > 80 ? "text-red-600" : "text-slate-400"}>{pct}%</span></div><Progress value={used} max={max} size="sm" color={pct > 80 ? "red" : pct > 60 ? "amber" : "emerald"} /></div>);
      }},
  ];

  return (
    <PageWrapper>
      <PageHeader title="Technicians" subtitle={active + " active of " + data.length + " total"} badge="TECH"
        actions={<button onClick={() => { refetch(); toast.success("Refreshed"); }} disabled={isFetching} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl"><RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} /></button>} />

      <StatusFilterTabs tabs={tabs} active={statusFilter} onChange={(v) => { setStatusFilter(v); goToPage(1); }} />

      <ActionBar search={{ value: query, onChange: setQuery, placeholder: "Search technicians..." }} resultCount={filtered.length} totalCount={data.length} />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? <LoadingState type="table" rows={8} /> :
         items.length === 0 ? <EmptyState icon="👷" title="No technicians" description="No field team members found" /> :
         <DataTable columns={columns} data={items} />}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={goToPage} total={filtered.length} pageSize={pageSize} onPageSize={(s) => { setPageSize(s); goToPage(1); }} />
    </PageWrapper>
  );
}
