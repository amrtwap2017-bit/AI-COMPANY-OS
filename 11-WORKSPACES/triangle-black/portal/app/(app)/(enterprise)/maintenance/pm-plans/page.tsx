"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { maintenanceApi } from "@/lib/maintenance-api";
import { PageHeader, Button, DataTable, SearchInput, LoadingState, EmptyState } from "@/components/ui";
import { fmtCurrency, getStatus } from "@/lib/design-tokens";
import Link from "next/link";
import { RefreshCw, Plus, ChevronRight, Calendar, Clock, Wrench } from "lucide-react";

export default function PMPlansPage() {
  const [tab, setTab]       = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(0);
  const LIMIT = 25;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["pm-plans", page],
    queryFn:  () => maintenanceApi.list("pm-plans"),
    staleTime: 30_000,
  });

  const rawAll = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : data?.data?.items || data?.data?.data || [];
  const all: any[] = rawAll.map((r: any) => ({
    ...r,
    name:           r.name           || r.title     || "Untitled Plan",
    category:       r.category       || r.plan_type || "Preventive",
    frequency:      r.frequency      || "Monthly",
    estimated_cost: r.estimated_cost || 0,
    active_assets:  r.active_assets  || 0,
  }));

  const total    = typeof data?.data?.total === "number" ? data.data.total : all.length;
  const filtered = all.filter(r =>
    (tab === "all" || r.status === tab) &&
    (!search || r.name?.toLowerCase().includes(search.toLowerCase()))
  );

  const statuses = ["all", "active", "paused"];
  const counts: Record<string, number> = statuses.reduce((a: Record<string, number>, t) => {
    a[t] = t === "all" ? all.length : all.filter((r: any) => r.status === t).length;
    return a;
  }, {});

  const columns = [
    { key: "name",           label: "PM Plan Name",           render: (row: any) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><Calendar className="w-4 h-4" /></div>
        <div>
          <div className="font-semibold text-slate-900 text-sm">{row.name}</div>
          <div className="text-xs text-slate-500">{row.category}</div>
        </div>
      </div>
    )},
    { key: "frequency",      label: "Frequency",               render: (row: any) => (
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
        <Clock className="w-3.5 h-3.5 text-slate-400" /> {row.frequency}
      </div>
    )},
    { key: "active_assets",  label: "Linked Assets",           render: (row: any) => (
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
        <Wrench className="w-3.5 h-3.5 text-slate-400" /> {row.active_assets || 0} Assets
      </div>
    )},
    { key: "estimated_cost", label: "Est. Cost / Occurrence",  render: (row: any) => (
      <span className="text-sm font-semibold text-slate-900">{fmtCurrency(row.estimated_cost)}</span>
    )},
    { key: "status",         label: "Status",                  render: (row: any) => {
      const s = getStatus(row.status);
      return <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${s.bg} ${s.text} border ${s.border}`}>{(row.status || "active").replace("_", " ")}</span>;
    }},
    { key: "actions",        label: "",                         render: (row: any) => (
      <Link href={`/maintenance/pm-plans/${row.id}`} className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700">
        Manage <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    )},
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Preventive Maintenance Plans"
        subtitle={`${total} recurring maintenance templates`}
        badge="PM"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />} onClick={() => refetch()}>Refresh</Button>
            <Button variant="primary"   size="sm" icon={<Plus className="w-3.5 h-3.5" />}>Create PM Plan</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total PM Plans",       val: total,                                                                                                                                                    bg: "bg-slate-50",   border: "border-slate-200",   txt: "text-slate-900"   },
          { label: "Active Plans",         val: counts["active"] ?? 0,                                                                                                                                    bg: "bg-emerald-50", border: "border-emerald-200", txt: "text-emerald-700" },
          { label: "Total Linked Assets",  val: all.reduce((sum: number, r: any) => sum + (r.active_assets || 0), 0),                                                                                     bg: "bg-blue-50",    border: "border-blue-200",    txt: "text-blue-700"    },
          { label: "Est. Monthly PM Cost", val: fmtCurrency(all.reduce((sum: number, r: any) => sum + ((r.estimated_cost || 0) * (r.frequency === "Monthly" ? 1 : r.frequency === "Quarterly" ? 0.33 : 0.08)), 0)), bg: "bg-amber-50",   border: "border-amber-200",   txt: "text-amber-700"   },
        ].map(k => (
          <div key={k.label} className={`rounded-2xl border ${k.border} ${k.bg} p-4`}>
            <div className={`text-2xl font-bold ${k.txt}`}>{k.val}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wide">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1 flex-wrap">
          {statuses.map(t => (
            <button key={t} onClick={() => { setTab(t); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === t ? "bg-amber-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}>
              {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
              {counts[t] > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${tab === t ? "bg-amber-700 text-white" : "bg-slate-200 text-slate-600"}`}>{counts[t]}</span>
              )}
            </button>
          ))}
        </div>
        <SearchInput placeholder="Search PM plans..." value={search} onChange={e => setSearch(e.target.value)} className="w-full lg:w-64" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? <LoadingState type="table" rows={8} /> : filtered.length === 0 ? <EmptyState icon="📅" title="No PM plans found" /> : (
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
