"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const PRIORITY_BADGE = {
  critical: "bg-red-500 text-white",
  high:     "bg-orange-100 text-orange-700",
  medium:   "bg-amber-100 text-amber-700",
  low:      "bg-slate-100 text-secondary",
};
const STATUS_BADGE = {
  open:        "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed:   "bg-emerald-100 text-emerald-700",
  cancelled:   "bg-slate-100 text-secondary",
};

export default function WorkOrdersPage() {
  const router = useRouter();
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const { data: raw, isLoading } = useQuery(
    ["wo-list"],
    () => authFetch("/api/v1/work-orders/").then(r => r.json()),
    { refetchInterval: 60000 }
  );
  const wos = toArr(raw);
  const now = new Date();

  const filtered = wos.filter(w => {
    const matchSearch   = !search || w.title?.toLowerCase().includes(search.toLowerCase()) || w.id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus   = statusFilter === "all" || w.status === statusFilter;
    const matchPriority = priorityFilter === "all" || w.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const open        = wos.filter(w => w.status === "open");
  const inProgress  = wos.filter(w => w.status === "in_progress");
  const completed   = wos.filter(w => w.status === "completed");
  const critical    = wos.filter(w => w.priority === "critical" && w.status !== "completed");
  const overdue     = wos.filter(w => w.due_date && new Date(w.due_date) < now && w.status !== "completed");
  const compRate    = wos.length > 0 ? Math.round(completed.length / wos.length * 100) : 0;

  if (isLoading) return (
    <div className="p-6 space-y-6">
      <div className="animate-pulse">
        <div className="h-3 bg-orange-200 rounded w-20 mb-2"/>
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2"/>
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-80"/>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i=><div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border p-5 h-24 animate-pulse"/>)}
      </div>
    </div>
  );

  return (
    <div className="tb-page">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1.5">Operations</div>
          <h1 className="text-3xl font-black text-primary">Work Orders</h1>
          <p className="text-secondary text-sm mt-1.5">
            {wos.length} total · {open.length} open · {overdue.length} overdue
          </p>
        </div>
        <button onClick={() => router.push("/engineering/new-work-order")}
          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-brand hover:bg-brand-hover text-inverse shadow-sm hover:shadow-md transition-all">
          + New Work Order
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label:"Total",       value:wos.length,        color:"slate",   filter:"all",         priority:"all" },
          { label:"Open",        value:open.length,       color:"blue",    filter:"open",         priority:"all" },
          { label:"In Progress", value:inProgress.length, color:"amber",   filter:"in_progress",  priority:"all" },
          { label:"Completed",   value:completed.length,  color:"emerald", filter:"completed",    priority:"all" },
          { label:"Critical",    value:critical.length,   color:"red",     filter:"all",          priority:"critical" },
          { label:"Completion",  value:`${compRate}%`,    color:compRate>=80?"emerald":"amber", filter:"all", priority:"all" },
        ].map((k,i) => (
          <button key={i}
            onClick={() => { setStatusFilter(k.filter); setPriorityFilter(k.priority); }}
            className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 text-center transition-all hover:shadow-md ${
              statusFilter === k.filter && priorityFilter === k.priority
                ? `border-${k.color}-400 shadow-sm`
                : "border-slate-200 dark:border-slate-800 hover:border-amber-300"
            }`}>
            <div className={`text-2xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-secondary mt-0.5">{k.label}</div>
          </button>
        ))}
      </div>

      {/* Critical alert banner */}
      {critical.length > 0 && (
        <div className="tb-alert tb-alert-critical rounded-2xl">
          <div className="text-2xl flex-shrink-0">🚨</div>
          <div className="flex-1">
            <div className="font-bold text-red-800 dark:text-red-300">{critical.length} Critical Work Orders Require Immediate Attention</div>
            <div className="text-sm text-red-600 mt-0.5">{critical.slice(0,2).map(w=>w.title).join(" · ")}{critical.length > 2 ? ` +${critical.length-2} more` : ""}</div>
          </div>
          <button onClick={() => { setPriorityFilter("critical"); setStatusFilter("all"); }}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors flex-shrink-0">
            View Critical
          </button>
        </div>
      )}

      {/* Search + filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search work orders..."
          className="flex-1 min-w-48 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-border-focus transition-colors"
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-surface border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-border-focus">
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
          className="bg-surface border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-border-focus">
          <option value="all">All Priority</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {(search || statusFilter !== "all" || priorityFilter !== "all") && (
          <button onClick={() => { setSearch(""); setStatusFilter("all"); setPriorityFilter("all"); }}
            className="px-3 py-2 text-xs text-secondary hover:text-slate-700 bg-surface border border-border rounded-xl transition-colors">
            Clear ×
          </button>
        )}
        <div className="text-xs text-tertiary self-center">{filtered.length} results</div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔍</div>
            <div className="font-bold text-primary text-lg">No work orders found</div>
            <div className="text-tertiary text-sm mt-1">Try adjusting your filters</div>
            <button onClick={() => router.push("/engineering/new-work-order")}
              className="mt-4 px-5 py-2 bg-brand text-inverse rounded-xl text-sm font-bold hover:bg-amber-700 transition-colors">
              + Create Work Order
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_100px_90px_100px_100px] bg-base-alt dark:bg-surface-alt px-5 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">
              <div>Work Order</div>
              <div className="text-center">Priority</div>
              <div className="text-center">Status</div>
              <div className="text-center">Due Date</div>
              <div className="text-center">Created</div>
            </div>
            <div className="divide-y divide-y-border">
              {filtered.slice(0, 50).map((w, i) => {
                const isOverdue = w.due_date && new Date(w.due_date) < now && w.status !== "completed";
                return (
                  <button key={i} onClick={() => router.push(`/operations/work-orders/${w.id}`)}
                    className={`w-full grid grid-cols-[1fr_100px_90px_100px_100px] items-center px-5 py-4 text-left transition-colors hover:bg-brand-light/20 ${isOverdue && w.status !== "completed" ? "bg-red-50/30 dark:bg-red-900/5" : ""}`}>
                    <div className="min-w-0 pr-4">
                      <div className="font-semibold text-sm text-primary truncate">{w.title}</div>
                      {w.type && <div className="text-xs text-tertiary mt-0.5 capitalize">{w.type}</div>}
                    </div>
                    <div className="text-center">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${PRIORITY_BADGE[w.priority] || "bg-slate-100 text-secondary"}`}>
                        {w.priority || "—"}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${STATUS_BADGE[w.status] || "bg-slate-100 text-secondary"}`}>
                        {w.status || "—"}
                      </span>
                    </div>
                    <div className={`text-center text-xs ${isOverdue ? "text-red-500 font-semibold" : "text-secondary"}`}>
                      {fmtDate(w.due_date)}
                      {isOverdue && <div className="text-[10px] text-red-400">OVERDUE</div>}
                    </div>
                    <div className="text-center text-xs text-tertiary">{fmtDate(w.created_at)}</div>
                  </button>
                );
              })}
            </div>
            {filtered.length > 50 && (
              <div className="text-center py-4 text-xs text-tertiary bg-base-alt/30">
                Showing 50 of {filtered.length} · <button onClick={() => router.push("/operations/dispatch")} className="text-amber-500 hover:underline">View Dispatch →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
