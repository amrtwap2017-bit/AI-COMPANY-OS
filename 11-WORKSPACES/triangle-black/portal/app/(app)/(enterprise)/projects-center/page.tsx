"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_BADGE = {
  active:    "bg-emerald-100 text-emerald-700",
  planning:  "bg-blue-100 text-blue-700",
  completed: "bg-slate-100 text-slate-700 font-semibold",
  on_hold:   "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function ProjectsCenterPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: raw, isLoading } = useQuery(["proj-list"], () => authFetch("/api/v1/projects/").then(r=>r.json()));
  const { data: woRaw } = useQuery(["proj-wos"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const projects = toArr(raw);
  const wos = toArr(woRaw);

  const active    = projects.filter(p => p.status==="active");
  const planning  = projects.filter(p => p.status==="planning");
  const completed = projects.filter(p => p.status==="completed");
  const totalBudget = projects.reduce((s,p) => s+Number(p.budget||0), 0);
  const activeBudget = active.reduce((s,p) => s+Number(p.budget||0), 0);
  const avgCompletion = projects.length > 0 ? Math.round(projects.reduce((s,p)=>s+Number(p.completion_pct||0),0)/projects.length) : 0;

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter==="all" || p.status===statusFilter;
    return matchSearch && matchStatus;
  });

  if (isLoading) return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-40"/>
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border p-5 h-24"/>)}</div>
    </div>
  );

  return (
    <div className="tb-page">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-label-upper text-indigo-500 mb-1.5">Projects</div>
          <h1 className="text-page-title text-primary">Project Portfolio</h1>
          <p className="text-secondary text-sm mt-1.5">{projects.length} projects · {active.length} active · {fmtEGP(activeBudget)} active budget · {avgCompletion}% avg completion</p>
        </div>
        <div className={`rounded-2xl border px-6 py-4 text-center ${avgCompletion>=70?"bg-emerald-50 border-emerald-200":"bg-amber-50 border-amber-200"}`}>
          <div className={`text-4xl font-black ${avgCompletion>=70?"text-emerald-500":"text-amber-500"}`}>{avgCompletion}%</div>
          <div className="text-xs text-secondary mt-1">Avg Completion</div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Active",     value:active.length,    sub:fmtEGP(activeBudget),                color:"emerald", filter:"active" },
          { label:"Planning",   value:planning.length,  sub:"preparing to start",                 color:"blue",    filter:"planning" },
          { label:"Completed",  value:completed.length, sub:`of ${projects.length} total`,        color:"slate",   filter:"completed" },
          { label:"Total Budget",value:fmtEGP(totalBudget), sub:`${projects.length} projects`,   color:"purple",  filter:"all" },
        ].map((k,i)=>(
          <button key={i} onClick={()=>setStatusFilter(i<3?(statusFilter===k.filter?"all":k.filter):"all")}
            className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 text-center transition-all hover:shadow-md ${statusFilter===k.filter&&i<3?`border-${k.color}-400 shadow-sm`:"border-border hover:border-amber-300"}`}>
            <div className={`text-2xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-sm font-medium text-slate-700 dark:text-tertiary mt-1">{k.label}</div>
            <div className="text-xs text-tertiary mt-0.5 truncate">{k.sub}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search projects..."
          className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-border-focus"/>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
          className="bg-surface border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-border-focus">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="planning">Planning</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>
        {(search||statusFilter!=="all") && (
          <button onClick={()=>{setSearch("");setStatusFilter("all");}} className="px-3 py-2 text-xs text-secondary bg-surface border border-border rounded-xl">Clear ×</button>
        )}
        <div className="text-xs text-tertiary self-center">{filtered.length} projects</div>
      </div>

      {/* Project cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-2xl">
          <div className="text-5xl mb-3">🏗️</div>
          <div className="font-bold text-primary text-lg">No projects found</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p,i)=>{
            const pct     = Number(p.completion_pct || 0);
            const budget  = Number(p.budget || 0);
            const projWOs = wos.filter(w => w.project_id===p.id || w.contract_id===p.id);
            const sc      = STATUS_BADGE[p.status] || "bg-slate-100 text-secondary";
            const barColor = pct>=80?"emerald":pct>=50?"blue":"amber";
            const daysLeft = p.end_date ? Math.ceil((new Date(p.end_date)-Date.now())/86400000) : null;
            const isOverdue = daysLeft !== null && daysLeft < 0 && p.status !== "completed";

            return (
              <button key={i} onClick={()=>router.push(`/projects-center/${p.id}`)}
                className="bg-surface border border-border rounded-2xl p-6 text-left hover:border-amber-400 hover:shadow-lg transition-all group">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="font-bold text-primary group-hover:text-amber-600 transition-colors truncate">{p.title || p.name || p.id}</div>
                    <div className="text-xs text-tertiary mt-0.5 line-clamp-2">{p.description || "—"}</div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-lg flex-shrink-0 ${sc}`}>{p.status || "—"}</span>
                </div>

                {/* Completion bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-secondary">Completion</span>
                    <span className={`font-bold text-${barColor}-500`}>{pct}%</span>
                  </div>
                  <div className="w-full bg-base-alt rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full bg-${barColor}-500 transition-all`} style={{width:`${Math.min(pct,100)}%`}}/>
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="bg-base-alt dark:bg-surface-alt rounded-xl p-2">
                    <div className="text-sm font-black text-purple-500">{fmtEGP(budget)}</div>
                    <div className="text-[10px] text-tertiary">Budget</div>
                  </div>
                  <div className="bg-base-alt dark:bg-surface-alt rounded-xl p-2">
                    <div className="text-sm font-black text-blue-500">{projWOs.length || 0}</div>
                    <div className="text-[10px] text-tertiary">Work Orders</div>
                  </div>
                  <div className="bg-base-alt dark:bg-surface-alt rounded-xl p-2">
                    <div className={`text-sm font-black ${isOverdue?"text-red-500":daysLeft!==null&&daysLeft<=30?"text-amber-500":"text-emerald-500"}`}>
                      {daysLeft!==null ? (isOverdue?`${Math.abs(daysLeft)}d over`:`${daysLeft}d`) : "—"}
                    </div>
                    <div className="text-[10px] text-tertiary">{isOverdue?"Overdue":"Remaining"}</div>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex justify-between text-xs text-tertiary">
                  <span>Start: {fmtDate(p.start_date)}</span>
                  <span className={isOverdue?"text-red-500 font-semibold":""}>End: {fmtDate(p.end_date)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Sub-nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Project List",     icon:"📋", path:"/projects-center/list" },
          { label:"Timeline",         icon:"📅", path:"/projects-center/timeline" },
          { label:"Actions Queue",    icon:"⚡", path:"/projects-center/actions" },
          { label:"Review Board",     icon:"📊", path:"/projects-center/review" },
        ].map((a,i)=>(
          <button key={i} onClick={()=>router.push(a.path)}
            className="bg-surface border border-border rounded-2xl p-4 text-center hover:border-amber-400 hover:shadow-md transition-all group">
            <div className="text-2xl mb-1.5">{a.icon}</div>
            <div className="text-sm font-semibold text-slate-700 dark:text-tertiary group-hover:text-amber-600">{a.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
