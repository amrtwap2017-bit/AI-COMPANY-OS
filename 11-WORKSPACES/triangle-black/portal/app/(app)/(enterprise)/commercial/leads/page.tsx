"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
  const [showCreate, setShowCreate] = useState(false);
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { CreateModal } from "@/components/ui/CreateModal";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const STATUS_BADGE = {
  new:         "bg-blue-100 text-blue-700",
  qualified:   "bg-purple-100 text-purple-700",
  proposal:    "bg-indigo-100 text-indigo-700",
  negotiation: "bg-amber-100 text-amber-700",
  won:         "bg-emerald-100 text-emerald-700 font-bold",
  lost:        "bg-slate-100 text-secondary",
};
const PRIORITY_BADGE = {
  high:   "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
  low:    "bg-slate-100 text-secondary",
};

export default function LeadsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: raw, isLoading } = useQuery(
    ["leads-list"],
    () => authFetch("/api/v1/leads/").then(r => r.json())
  );
  const leads = toArr(raw);

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.company?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeLeads  = leads.filter(l => l.status !== "won" && l.status !== "lost");
  const wonLeads     = leads.filter(l => l.status === "won");
  const hotLeads     = leads.filter(l => (l.score||0) >= 70 && l.status !== "won" && l.status !== "lost");
  const avgScore     = leads.length > 0 ? Math.round(leads.reduce((s,l)=>s+Number(l.score||0),0)/leads.length) : 0;

  if (isLoading) return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-32"/>
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i=><div key={i} className="bg-white rounded-2xl border p-5 h-24"/>)}
      </div>
    </div>
  );

  return (
    <div className="tb-page">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-label-upper text-amber-500 mb-1.5">Commercial</div>
          <h1 className="text-page-title text-primary">Lead Pipeline</h1>
          <p className="text-secondary text-sm mt-1.5">{leads.length} total · {activeLeads.length} active · {hotLeads.length} hot leads</p>
        </div>
        <button onClick={() => router.push("/leads/new")}
          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-brand hover:bg-brand-hover text-inverse shadow-sm hover:shadow-md transition-all">
          + New Lead
        </button>
      </div>

      {/* Pipeline stages */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label:"New",         value:leads.filter(l=>l.status==="new").length,         color:"blue",    status:"new" },
          { label:"Qualified",   value:leads.filter(l=>l.status==="qualified").length,   color:"purple",  status:"qualified" },
          { label:"Proposal",    value:leads.filter(l=>l.status==="proposal").length,    color:"indigo",  status:"proposal" },
          { label:"Negotiation", value:leads.filter(l=>l.status==="negotiation").length, color:"amber",   status:"negotiation" },
          { label:"Won ✓",       value:wonLeads.length,                                  color:"emerald", status:"won" },
          { label:"Hot Leads 🔥",value:hotLeads.length,                                  color:"red",     status:"all" },
        ].map((k,i)=>(
          <button key={i} onClick={()=>setStatusFilter(statusFilter===k.status?"all":k.status)}
            className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 text-center transition-all hover:shadow-md ${
              statusFilter===k.status ? `border-${k.color}-400 shadow-sm` : "border-border hover:border-amber-300"
            }`}>
            <div className={`text-2xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs font-medium text-secondary mt-0.5">{k.label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search leads by name or company..."
          className="flex-1 min-w-48 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-border-focus"/>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
          className="bg-surface border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-border-focus">
          <option value="all">All Stages</option>
          <option value="new">New</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
          <option value="negotiation">Negotiation</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
        {(search||statusFilter!=="all") && (
          <button onClick={()=>{setSearch("");setStatusFilter("all");}}
            className="px-3 py-2 text-xs text-secondary bg-surface border border-border rounded-xl">
            Clear ×
          </button>
        )}
        <div className="text-xs text-tertiary self-center">{filtered.length} leads · avg score {avgScore}</div>
      </div>

      {/* Leads table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">👤</div>
            <div className="font-bold text-primary text-lg">No leads found</div>
            <button onClick={()=>router.push("/leads/new")}
              className="mt-4 px-5 py-2 bg-brand text-inverse rounded-xl text-sm font-bold hover:bg-amber-700">
              + Add Lead
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_140px_100px_80px_100px] bg-base-alt dark:bg-surface-alt px-5 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">
              <div>Lead</div>
              <div>Company</div>
              <div className="text-center">Stage</div>
              <div className="text-center">Score</div>
              <div className="text-center">Updated</div>
            </div>
            <div className="divide-y divide-y-border">
              {filtered.map((l,i)=>{
                const score = Number(l.score || 0);
                const isHot = score >= 70 && l.status !== "won" && l.status !== "lost";
                return (
                  <button key={i} onClick={()=>router.push(`/commercial/leads/${l.id}`)}
                    className="w-full grid grid-cols-[1fr_140px_100px_80px_100px] items-center px-5 py-4 text-left hover:bg-brand-light/20 transition-colors group">
                    <div className="min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-sm text-primary truncate group-hover:text-amber-600">{l.name}</div>
                        {isHot && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold flex-shrink-0">🔥 HOT</span>}
                      </div>
                      <div className="text-xs text-tertiary mt-0.5">{l.source || "—"} · {l.email || "—"}</div>
                    </div>
                    <div className="text-xs text-secondary truncate">{l.company || "—"}</div>
                    <div className="text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${STATUS_BADGE[l.status] || "bg-slate-100 text-secondary"}`}>
                        {l.status || "—"}
                      </span>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-black ${score>=70?"text-emerald-500":score>=50?"text-amber-500":"text-secondary"}`}>{score}</div>
                      <div className="w-12 mx-auto bg-base-alt rounded-full h-1 mt-1">
                        <div className={`h-1 rounded-full ${score>=70?"bg-emerald-500":score>=50?"bg-amber-500":"bg-slate-400"}`} style={{width:`${score}%`}}/>
                      </div>
                    </div>
                    <div className="text-center text-xs text-tertiary">{fmtDate(l.updated_at)}</div>
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
