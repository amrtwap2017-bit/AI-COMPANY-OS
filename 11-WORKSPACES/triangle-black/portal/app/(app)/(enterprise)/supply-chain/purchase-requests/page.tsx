"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const STATUS_BADGE = {
  pending:   "bg-amber-100 text-amber-700",
  submitted: "bg-blue-100 text-blue-700",
  approved:  "bg-emerald-100 text-emerald-700",
  rejected:  "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-secondary",
};
const URGENCY_BADGE = {
  urgent:  "bg-red-100 text-red-700 font-bold",
  high:    "bg-orange-100 text-orange-700",
  normal:  "bg-slate-100 text-secondary",
  low:     "bg-slate-50 text-tertiary",
};

export default function PurchaseRequestsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  const { data: raw, isLoading } = useQuery(
    ["pr-list"],
    () => authFetch("/api/v1/purchase-requests/").then(r => r.json())
  );
  const prs = toArr(raw);

  const filtered = prs.filter(p => {
    const matchSearch  = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.pr_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus  = statusFilter === "all" || p.status === statusFilter;
    const matchUrgency = urgencyFilter === "all" || p.urgency === urgencyFilter;
    return matchSearch && matchStatus && matchUrgency;
  });

  const pending   = prs.filter(p => p.status === "pending");
  const submitted = prs.filter(p => p.status === "submitted");
  const approved  = prs.filter(p => p.status === "approved");
  const urgent    = prs.filter(p => p.urgency === "urgent");
  const autoPRs   = prs.filter(p => p.title?.startsWith("Auto-PR:"));

  if (isLoading) return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48"/>
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
          <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-1.5">Supply Chain</div>
          <h1 className="text-3xl font-black text-primary">Purchase Requests</h1>
          <p className="text-secondary text-sm mt-1.5">{prs.length} total · {pending.length} pending · {urgent.length} urgent · {autoPRs.length} auto-generated</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push("/workflows/launcher")}
            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-surface border border-border text-slate-700 dark:text-tertiary hover:border-amber-400 transition-all">
            ⚡ Auto-PR
          </button>
          <button onClick={() => router.push("/supply-chain/purchase-orders")}
            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-brand hover:bg-brand-hover text-inverse shadow-sm transition-all">
            View POs →
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:"Pending",    value:pending.length,   color:pending.length>0?"amber":"slate",   filter:"pending" },
          { label:"Submitted",  value:submitted.length, color:"blue",                              filter:"submitted" },
          { label:"Approved",   value:approved.length,  color:"emerald",                           filter:"approved" },
          { label:"Urgent",     value:urgent.length,    color:urgent.length>0?"red":"slate",       filter:"all" },
          { label:"Auto-PR",    value:autoPRs.length,   color:"purple",                            filter:"all" },
        ].map((k,i)=>(
          <button key={i} onClick={()=>setStatusFilter(statusFilter===k.filter?"all":k.filter)}
            className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 text-center transition-all hover:shadow-md ${
              statusFilter===k.filter ? `border-${k.color}-400 shadow-sm` : "border-slate-200 dark:border-slate-800 hover:border-amber-300"
            }`}>
            <div className={`text-2xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs font-medium text-secondary mt-0.5">{k.label}</div>
          </button>
        ))}
      </div>

      {/* Urgent alert */}
      {urgent.length > 0 && (
        <div className="tb-alert tb-alert-critical rounded-2xl">
          <div className="text-2xl">🚨</div>
          <div className="flex-1">
            <div className="font-bold text-red-800 dark:text-red-300">{urgent.length} Urgent Purchase Requests Need Immediate Approval</div>
            <div className="text-sm text-red-600 mt-0.5">{urgent.slice(0,2).map(p=>p.title).join(" · ")}</div>
          </div>
          <button onClick={()=>setUrgencyFilter("urgent")}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 flex-shrink-0">
            Show Urgent
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search purchase requests..."
          className="flex-1 min-w-48 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-border-focus"/>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
          className="bg-surface border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-border-focus">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={urgencyFilter} onChange={e=>setUrgencyFilter(e.target.value)}
          className="bg-surface border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-border-focus">
          <option value="all">All Urgency</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
        {(search||statusFilter!=="all"||urgencyFilter!=="all") && (
          <button onClick={()=>{setSearch("");setStatusFilter("all");setUrgencyFilter("all");}}
            className="px-3 py-2 text-xs text-secondary bg-surface border border-border rounded-xl">
            Clear ×
          </button>
        )}
        <div className="text-xs text-tertiary self-center">{filtered.length} requests</div>
      </div>

      {/* PR table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🛒</div>
            <div className="font-bold text-primary text-lg">No purchase requests found</div>
            <div className="text-tertiary text-sm mt-1">Run automation engine to auto-generate PRs for low stock</div>
            <button onClick={()=>router.push("/workflows/launcher")}
              className="mt-4 px-5 py-2 bg-brand text-inverse rounded-xl text-sm font-bold hover:bg-amber-700">
              ⚡ Run Automation
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_120px_100px_100px_110px_100px] bg-base-alt dark:bg-surface-alt px-5 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">
              <div>Request</div>
              <div>PR Number</div>
              <div className="text-center">Status</div>
              <div className="text-center">Urgency</div>
              <div>Department</div>
              <div className="text-center">Required By</div>
            </div>
            <div className="divide-y divide-y-border">
              {filtered.map((pr,i)=>(
                <button key={i} onClick={()=>router.push(`/supply-chain/purchase-requests/${pr.id}`)}
                  className="w-full grid grid-cols-[1fr_120px_100px_100px_110px_100px] items-center px-5 py-4 text-left hover:bg-brand-light/20 transition-colors group">
                  <div className="min-w-0 pr-4">
                    <div className="font-semibold text-sm text-primary truncate group-hover:text-amber-600">{pr.title || pr.pr_number}</div>
                    <div className="text-xs text-tertiary mt-0.5">{pr.requester || "—"} · {pr.justification?.slice(0,50) || "—"}</div>
                  </div>
                  <div className="text-xs font-mono text-secondary truncate">{pr.pr_number || "—"}</div>
                  <div className="text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${STATUS_BADGE[pr.status]||"bg-slate-100 text-secondary"}`}>
                      {pr.status || "—"}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${URGENCY_BADGE[pr.urgency]||"bg-slate-100 text-secondary"}`}>
                      {pr.urgency || "—"}
                    </span>
                  </div>
                  <div className="text-xs text-secondary truncate">{pr.department || "—"}</div>
                  <div className="text-center text-xs text-tertiary">{fmtDate(pr.required_date)}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
