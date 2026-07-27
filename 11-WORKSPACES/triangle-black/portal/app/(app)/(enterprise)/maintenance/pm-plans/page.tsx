"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function PMPlansPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [duneFilter, setDueFilter] = useState("all");

  const { data: raw, isLoading } = useQuery(
    ["pm-list"],
    () => authFetch("/api/v1/maintenance/pm-plans/").then(r => r.json()),
    { refetchInterval: 120000 }
  );
  const plans = toArr(raw);
  const now = new Date();
  const in7  = new Date(now.getTime() + 7*86400000);
  const in30 = new Date(now.getTime() + 30*86400000);

  const overdue   = plans.filter(p => p.next_due_ts && new Date(p.next_due_ts) < now);
  const dueWeek   = plans.filter(p => p.next_due_ts && new Date(p.next_due_ts) >= now && new Date(p.next_due_ts) <= in7);
  const dueMonth  = plans.filter(p => p.next_due_ts && new Date(p.next_due_ts) >= now && new Date(p.next_due_ts) <= in30);
  const scheduled = plans.filter(p => p.next_due_ts && new Date(p.next_due_ts) > in30);
  const types     = [...new Set(plans.map(p => p.plan_type || "general"))].sort();

  const filtered = plans.filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === "all" || (p.plan_type || "general") === typeFilter;
    const matchDue    = duneFilter === "all" ||
      (duneFilter === "overdue" && p.next_due_ts && new Date(p.next_due_ts) < now) ||
      (duneFilter === "week"    && p.next_due_ts && new Date(p.next_due_ts) >= now && new Date(p.next_due_ts) <= in7) ||
      (duneFilter === "month"   && p.next_due_ts && new Date(p.next_due_ts) >= now && new Date(p.next_due_ts) <= in30);
    return matchSearch && matchType && matchDue;
  });

  if (isLoading) return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-40"/>
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i=><div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border p-5 h-24"/>)}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1.5">Maintenance</div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">PM Plans</h1>
          <p className="text-slate-500 text-sm mt-1.5">{plans.length} plans · {overdue.length} overdue · {dueWeek.length} due this week</p>
        </div>
        <button onClick={() => router.push("/workflows/launcher")}
          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow-md transition-all">
          ⚡ Auto-Create WOs
        </button>
      </div>

      {/* KPI strip — clickable filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Overdue",       value:overdue.length,   color:overdue.length>0?"red":"emerald",   filter:"overdue", sub:"require immediate action" },
          { label:"Due This Week", value:dueWeek.length,   color:dueWeek.length>0?"amber":"slate",   filter:"week",    sub:"schedule now" },
          { label:"Due This Month",value:dueMonth.length,  color:"blue",                              filter:"month",   sub:"plan ahead" },
          { label:"Scheduled",     value:scheduled.length, color:"emerald",                           filter:"all",     sub:"future plans" },
        ].map((k,i)=>(
          <button key={i} onClick={()=>setDueFilter(duneFilter===k.filter?"all":k.filter)}
            className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 text-center transition-all hover:shadow-md ${
              duneFilter===k.filter ? `border-${k.color}-400 shadow-sm bg-${k.color}-50/30` : "border-slate-200 dark:border-slate-800 hover:border-amber-300"
            }`}>
            <div className={`text-3xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">{k.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{k.sub}</div>
          </button>
        ))}
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className="text-2xl">🔧</div>
          <div className="flex-1">
            <div className="font-bold text-red-800 dark:text-red-300">{overdue.length} Preventive Maintenance Plans Are Overdue</div>
            <div className="text-sm text-red-600 mt-0.5">{overdue.slice(0,2).map(p=>p.title).join(" · ")}{overdue.length>2?` +${overdue.length-2} more`:""}</div>
          </div>
          <button onClick={()=>setDueFilter("overdue")}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 flex-shrink-0">
            Show Overdue
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search PM plans..."
          className="flex-1 min-w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"/>
        <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400">
          <option value="all">All Types</option>
          {types.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        {(search||typeFilter!=="all"||duneFilter!=="all") && (
          <button onClick={()=>{setSearch("");setTypeFilter("all");setDueFilter("all");}}
            className="px-3 py-2 text-xs text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
            Clear ×
          </button>
        )}
        <div className="text-xs text-slate-400 self-center">{filtered.length} plans</div>
      </div>

      {/* PM Plans table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📅</div>
            <div className="font-bold text-slate-900 dark:text-white text-lg">No plans match your filters</div>
            <div className="text-slate-400 text-sm mt-1">Try adjusting your search</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_120px_100px_130px_130px] bg-slate-50 dark:bg-slate-800/50 px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div>Plan</div>
              <div>Type</div>
              <div>Frequency</div>
              <div className="text-center">Next Due</div>
              <div>Owner</div>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {filtered.map((p,i)=>{
                const isOverdue  = p.next_due_ts && new Date(p.next_due_ts) < now;
                const isDueWeek  = !isOverdue && p.next_due_ts && new Date(p.next_due_ts) <= in7;
                const isDueMonth = !isOverdue && !isDueWeek && p.next_due_ts && new Date(p.next_due_ts) <= in30;
                return (
                  <button key={i} onClick={()=>router.push(`/maintenance/pm-plans/${p.id}`)}
                    className={`w-full grid grid-cols-[1fr_120px_100px_130px_130px] items-center px-5 py-4 text-left transition-colors group ${
                      isOverdue ? "bg-red-50/40 dark:bg-red-900/10 hover:bg-red-50" : isDueWeek ? "bg-amber-50/30 hover:bg-amber-50" : "hover:bg-amber-50/50 dark:hover:bg-amber-900/10"
                    }`}>
                    <div className="min-w-0 pr-4">
                      <div className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-amber-600">{p.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{p.notes?.slice(0,60) || p.asset_node_id || "—"}</div>
                    </div>
                    <div className="text-xs text-slate-500 capitalize">{p.plan_type || "—"}</div>
                    <div className="text-xs text-slate-500 capitalize">{p.frequency || "—"}</div>
                    <div className="text-center">
                      <div className={`text-xs font-medium ${isOverdue?"text-red-600 font-bold":isDueWeek?"text-amber-600":isDueMonth?"text-blue-600":"text-slate-500"}`}>
                        {fmtDate(p.next_due_ts || p.next_due_date)}
                      </div>
                      {isOverdue && <div className="text-[10px] bg-red-100 text-red-700 px-1.5 rounded mt-0.5">OVERDUE</div>}
                      {isDueWeek && <div className="text-[10px] bg-amber-100 text-amber-700 px-1.5 rounded mt-0.5">THIS WEEK</div>}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{p.owner || "—"}</div>
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
