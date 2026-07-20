"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { maintenanceApi } from "@/lib/maintenance-api";
import { PageHeader, Button, DataTable, SearchInput, LoadingState, EmptyState } from "@/components/ui";
import { fmtDate, getStatus } from "@/lib/design-tokens";
import Link from "next/link";
import { RefreshCw, Plus, ChevronRight, MapPin, AlertCircle } from "lucide-react";

export default function PMSchedulePage() {
  const [tab, setTab]       = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(0);
  const LIMIT = 25;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["pm-schedule", page],
    queryFn:  () => maintenanceApi.list("schedules", { limit: LIMIT }),
    staleTime: 30_000,
  });

  const rawAll = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : data?.data?.items || data?.data?.data || [];
  const all: any[] = rawAll.map((r: any) => ({
    ...r,
    task_name:   r.task_name   || r.title           || "Untitled",
    asset_name:  r.asset_name  || r.asset_node_id   || "",
    location:    r.location    || "",
    due_date:    r.due_date    || r.schedule_date    || "",
    assigned_to: r.assigned_to || r.owner           || "Unassigned",
  }));

  const total    = typeof data?.data?.total === "number" ? data.data.total : all.length;
  const filtered = all.filter(r =>
    (tab === "all" || r.status === tab) &&
    (!search || r.task_name?.toLowerCase().includes(search.toLowerCase()) || r.asset_name?.toLowerCase().includes(search.toLowerCase()))
  );

  const statuses = ["all", "pending", "scheduled", "in_progress", "completed", "overdue"];
  const counts: Record<string, number> = statuses.reduce((a: Record<string, number>, t) => {
    a[t] = t === "all" ? all.length : all.filter((r: any) => r.status === t).length;
    return a;
  }, {});

  const columns = [
    { key: "task_name",   label: "PM Task",          render: (row: any) => (
      <div>
        <div className="font-semibold text-slate-900 text-sm">{row.task_name}</div>
        <div className="text-xs text-slate-500 font-medium">{row.asset_name}</div>
      </div>
    )},
    { key: "location",    label: "Site / Location",  render: (row: any) => (
      <div className="flex items-center gap-1.5 text-xs text-slate-600">
        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {row.location}
      </div>
    )},
    { key: "due_date",    label: "Due Date",          render: (row: any) => {
      const isOverdue = row.due_date && new Date(row.due_date) < new Date() && row.status !== "completed";
      return (
        <div className={`flex items-center gap-1.5 text-xs font-medium ${isOverdue ? "text-red-600" : "text-slate-700"}`}>
          {isOverdue && <AlertCircle className="w-3.5 h-3.5" />}
          {fmtDate(row.due_date)}
        </div>
      );
    }},
    { key: "assigned_to", label: "Technician",        render: (row: any) => (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
          {row.assigned_to !== "Unassigned"
            ? String(row.assigned_to).split(" ").map((n: string) => n[0]).join("").slice(0, 2)
            : "?"}
        </div>
        <span className="text-xs text-slate-700">{row.assigned_to}</span>
      </div>
    )},
    { key: "status",      label: "Status",            render: (row: any) => {
      const s = getStatus(row.status);
      return <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${s.bg} ${s.text} border ${s.border}`}>{(row.status || "").replace("_", " ")}</span>;
    }},
    { key: "actions",     label: "",                  render: (row: any) => (
      <Link href={`/maintenance/work-orders/new?pm_id=${row.id}`} className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700">
        {row.status === "pending" ? "Assign & Start" : "View"} <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    )},
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="PM Schedule & Dispatch"
        subtitle={`${total} upcoming preventive maintenance tasks`}
        badge="SCH"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />} onClick={() => refetch()}>Refresh</Button>
            <Button variant="primary"   size="sm" icon={<Plus className="w-3.5 h-3.5" />}>Manual Dispatch</Button>
          </div>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1 flex-wrap">
          {statuses.map(t => (
            <button key={t} onClick={() => { setTab(t); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === t ? "bg-amber-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}>
              {t === "all" ? "All" : t.replace("_", " ").charAt(0).toUpperCase() + t.replace("_", " ").slice(1)}
              {counts[t] > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${tab === t ? "bg-amber-700 text-white" : "bg-slate-200 text-slate-600"}`}>{counts[t]}</span>
              )}
            </button>
          ))}
        </div>
        <SearchInput placeholder="Search tasks, assets, or sites..." value={search} onChange={e => setSearch(e.target.value)} className="w-full lg:w-64" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? <LoadingState type="table" rows={8} /> : filtered.length === 0 ? <EmptyState icon="📅" title="No scheduled tasks found" /> : (
          <>
            <DataTable columns={columns} data={filtered} />
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
              <div className="text-xs text-slate-500">Showing {filtered.length} of {total}</div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="xs" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Previous</Button>
                <span className="text-xs text-slate-500 font-medium">Page {page + 1}</span>
                <Button variant="secondary" size="xs" onClick={() => setPage(p => p + 1)} disabled={all.length < LIMIT}>Next</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
