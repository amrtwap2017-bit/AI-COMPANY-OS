"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const STATUS_CONFIG = {
  "Operational":        { cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  "In Fault":           { cls: "bg-red-100 text-red-700",         dot: "bg-red-500" },
  "Under Maintenance":  { cls: "bg-amber-100 text-amber-700",     dot: "bg-amber-500" },
};
const CRIT_CONFIG = {
  critical: "bg-red-100 text-red-700",
  high:     "bg-orange-100 text-orange-700",
  medium:   "bg-amber-100 text-amber-700",
  low:      "bg-slate-100 text-secondary",
};

export default function AssetsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [critFilter, setCritFilter] = useState("all");

  const { data: raw, isLoading } = useQuery(
    ["assets-list"],
    () => authFetch("/api/v1/assets/").then(r => r.json()),
    { refetchInterval: 120000 }
  );
  const assets = toArr(raw);

  const categories = [...new Set(assets.map(a => a.category || "Other"))].sort();
  const filtered = assets.filter(a => {
    const matchSearch = !search || a.name?.toLowerCase().includes(search.toLowerCase()) || a.serial_number?.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === "all" || (a.category || "Other") === catFilter;
    const matchCrit   = critFilter === "all" || a.criticality === critFilter;
    return matchSearch && matchCat && matchCrit;
  });

  const operational   = assets.filter(a => a.status === "Operational");
  const faulted       = assets.filter(a => a.status === "In Fault");
  const underMaint    = assets.filter(a => a.status === "Under Maintenance");
  const critical      = assets.filter(a => a.criticality === "critical");
  const withHistory   = assets.filter(a => a.last_maintenance_date);
  const overdueService = assets.filter(a => a.next_maintenance_date && new Date(a.next_maintenance_date) < new Date());

  if (isLoading) return (
    <div className="p-6 space-y-6">
      <div className="animate-pulse space-y-3">
        <div className="h-3 bg-red-200 rounded w-24"/>
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-40"/>
        <div className="h-4 bg-slate-100 rounded w-64"/>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i=><div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border p-5 h-24 animate-pulse"/>)}
      </div>
    </div>
  );

  return (
    <div className="tb-page">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1.5">Maintenance</div>
          <h1 className="text-3xl font-black text-primary">Asset Registry</h1>
          <p className="text-secondary text-sm mt-1.5">{assets.length} assets · {operational.length} operational · {critical.length} critical</p>
        </div>
        <button onClick={() => router.push("/maintenance/asset-tree")}
          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-brand hover:bg-brand-hover text-inverse shadow-sm hover:shadow-md transition-all">
          Asset Tree View
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label:"Total Assets",     value:assets.length,        color:"slate",   sub:"all equipment" },
          { label:"Operational",      value:operational.length,   color:"emerald", sub:`${Math.round(operational.length/Math.max(assets.length,1)*100)}% uptime` },
          { label:"In Fault",         value:faulted.length,       color:faulted.length>0?"red":"emerald",   sub:"require repair" },
          { label:"Under Maintenance",value:underMaint.length,    color:"amber",   sub:"in service" },
          { label:"Critical Assets",  value:critical.length,      color:"red",     sub:"priority monitoring" },
          { label:"Overdue Service",  value:overdueService.length,color:overdueService.length>0?"red":"emerald",sub:"past service date" },
        ].map((k,i)=>(
          <div key={i} className="bg-surface border border-border rounded-2xl p-4 text-center">
            <div className={`text-2xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs font-medium text-secondary mt-0.5">{k.label}</div>
            <div className="text-[10px] text-tertiary mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Fault alert */}
      {faulted.length > 0 && (
        <div className="tb-alert tb-alert-critical rounded-2xl">
          <div className="text-2xl">⚠️</div>
          <div className="flex-1">
            <div className="font-bold text-red-800 dark:text-red-300">{faulted.length} Assets In Fault — Immediate Attention Required</div>
            <div className="text-sm text-red-600 mt-0.5">{faulted.slice(0,2).map(a=>a.name).join(" · ")}{faulted.length>2?` +${faulted.length-2} more`:""}</div>
          </div>
          <button onClick={() => router.push("/maintenance/actions")}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors flex-shrink-0">
            View Faults
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search assets by name or serial..."
          className="flex-1 min-w-48 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-border-focus"/>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)}
          className="bg-surface border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-border-focus">
          <option value="all">All Categories</option>
          {categories.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={critFilter} onChange={e=>setCritFilter(e.target.value)}
          className="bg-surface border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-border-focus">
          <option value="all">All Criticality</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {(search||catFilter!=="all"||critFilter!=="all") && (
          <button onClick={()=>{setSearch("");setCatFilter("all");setCritFilter("all");}}
            className="px-3 py-2 text-xs text-secondary bg-surface border border-border rounded-xl hover:text-slate-700">
            Clear ×
          </button>
        )}
        <div className="text-xs text-tertiary self-center">{filtered.length} assets</div>
      </div>

      {/* Asset table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🏗️</div>
            <div className="font-bold text-primary text-lg">No assets found</div>
            <div className="text-tertiary text-sm mt-1">Try adjusting your search or filters</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_120px_100px_100px_120px_120px] bg-base-alt dark:bg-surface-alt px-5 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">
              <div>Asset</div>
              <div>Category</div>
              <div className="text-center">Status</div>
              <div className="text-center">Criticality</div>
              <div className="text-center">Last Service</div>
              <div className="text-center">Next Service</div>
            </div>
            <div className="divide-y divide-y-border">
              {filtered.map((a,i)=>{
                const sc = STATUS_CONFIG[a.status] || { cls:"bg-slate-100 text-secondary", dot:"bg-slate-400" };
                const isOverdue = a.next_maintenance_date && new Date(a.next_maintenance_date) < new Date();
                return (
                  <button key={i} onClick={()=>router.push(`/maintenance/assets/${a.id}`)}
                    className="w-full grid grid-cols-[1fr_120px_100px_100px_120px_120px] items-center px-5 py-4 text-left hover:bg-brand-light/20 transition-colors group">
                    <div className="min-w-0 pr-4">
                      <div className="font-semibold text-sm text-primary truncate group-hover:text-amber-600 transition-colors">{a.name}</div>
                      <div className="text-xs text-tertiary mt-0.5">{a.manufacturer} {a.model} · {a.location_description || a.serial_number || "—"}</div>
                    </div>
                    <div className="text-xs text-secondary truncate">{a.category || "—"}</div>
                    <div className="text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-lg ${sc.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}/>
                        {a.status || "—"}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${CRIT_CONFIG[a.criticality] || "bg-slate-100 text-secondary"}`}>
                        {a.criticality || "—"}
                      </span>
                    </div>
                    <div className="text-center text-xs text-secondary">{fmtDate(a.last_maintenance_date)}</div>
                    <div className={`text-center text-xs ${isOverdue?"text-red-500 font-semibold":"text-secondary"}`}>
                      {fmtDate(a.next_maintenance_date)}
                      {isOverdue && <div className="text-[10px] text-red-400">OVERDUE</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
