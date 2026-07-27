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
  open:        "bg-blue-100 text-blue-700",
  new:         "bg-indigo-100 text-indigo-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved:    "bg-emerald-100 text-emerald-700",
  closed:      "bg-slate-100 text-secondary",
};
const URGENCY_BADGE = {
  urgent:  "bg-red-100 text-red-700 font-bold",
  high:    "bg-orange-100 text-orange-700",
  normal:  "bg-slate-100 text-secondary",
  low:     "bg-slate-50 text-tertiary",
};

export default function ServiceRequestsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: raw, isLoading } = useQuery(["sr-list"], () => authFetch("/api/v1/service-requests/").then(r=>r.json()), {refetchInterval:60000});
  const srs = toArr(raw);

  const open       = srs.filter(s => s.status==="open" || s.status==="new");
  const inProgress = srs.filter(s => s.status==="in_progress");
  const linked     = srs.filter(s => s.work_order_id);
  const unlinked   = srs.filter(s => !s.work_order_id && (s.status==="open"||s.status==="new"));
  const urgent     = srs.filter(s => s.urgency==="urgent");

  const filtered = srs.filter(s => {
    const matchSearch = !search || s.title?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter==="all" || s.status===statusFilter || (statusFilter==="unlinked" && !s.work_order_id && (s.status==="open"||s.status==="new"));
    return matchSearch && matchStatus;
  });

  if (isLoading) return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48"/>
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border p-5 h-24"/>)}</div>
    </div>
  );

  return (
    <div className="tb-page">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1.5">Operations</div>
          <h1 className="text-3xl font-black text-primary">Service Requests</h1>
          <p className="text-secondary text-sm mt-1.5">{srs.length} total · {open.length} open · {unlinked.length} need work order · {linked.length} linked</p>
        </div>
        <button onClick={()=>setShowCreate(true)}
          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-brand hover:bg-brand-hover text-inverse shadow-sm transition-all">
          ⚡ Auto-Link WOs
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:"Open",        value:open.length,       color:"blue",    filter:"open" },
          { label:"In Progress", value:inProgress.length, color:"amber",   filter:"in_progress" },
          { label:"Linked to WO",value:linked.length,     color:"emerald", filter:"all" },
          { label:"Not Linked",  value:unlinked.length,   color:unlinked.length>0?"red":"slate", filter:"unlinked" },
          { label:"Urgent",      value:urgent.length,     color:urgent.length>0?"red":"slate",   filter:"all" },
        ].map((k,i)=>(
          <button key={i} onClick={()=>setStatusFilter(statusFilter===k.filter&&k.filter!=="all"?"all":k.filter)}
            className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 text-center transition-all hover:shadow-md ${statusFilter===k.filter&&k.filter!=="all"?`border-${k.color}-400 shadow-sm`:"border-slate-200 dark:border-slate-800 hover:border-amber-300"}`}>
            <div className={`text-2xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs font-medium text-secondary mt-0.5">{k.label}</div>
          </button>
        ))}
      </div>

      {unlinked.length > 0 && (
        <div className="tb-alert tb-alert-info rounded-2xl">
          <div className="text-2xl">🔗</div>
          <div className="flex-1">
            <div className="font-bold text-blue-800 dark:text-blue-300">{unlinked.length} Open Service Requests Have No Work Order</div>
            <div className="text-sm text-blue-600 mt-0.5">Run automation to auto-create and link work orders</div>
          </div>
          <button onClick={()=>setShowCreate(true)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex-shrink-0">
            ⚡ Auto-Link
          </button>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search service requests..."
          className="flex-1 min-w-48 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-border-focus"/>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
          className="bg-surface border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-border-focus">
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="unlinked">Not Linked to WO</option>
        </select>
        {(search||statusFilter!=="all") && (
          <button onClick={()=>{setSearch("");setStatusFilter("all");}} className="px-3 py-2 text-xs text-secondary bg-surface border border-border rounded-xl">Clear ×</button>
        )}
        <div className="text-xs text-tertiary self-center">{filtered.length} requests</div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📋</div>
            <div className="font-bold text-primary text-lg">No service requests found</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_100px_100px_90px_120px] bg-base-alt dark:bg-surface-alt px-5 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">
              <div>Request</div>
              <div className="text-center">Status</div>
              <div className="text-center">Urgency</div>
              <div className="text-center">Work Order</div>
              <div className="text-center">Created</div>
            </div>
            <div className="divide-y divide-y-border">
              {filtered.map((sr,i)=>(
                <button key={i} onClick={()=>router.push(`/operations/service-requests/${sr.id}`)}
                  className="w-full grid grid-cols-[1fr_100px_100px_90px_120px] items-center px-5 py-4 text-left hover:bg-brand-light/20 transition-colors group">
                  <div className="min-w-0 pr-4">
                    <div className="font-semibold text-sm text-primary truncate group-hover:text-amber-600">{sr.title||sr.description||"—"}</div>
                    <div className="text-xs text-tertiary mt-0.5">{sr.category||"—"} · {sr.submitted_by||"—"}</div>
                  </div>
                  <div className="text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${STATUS_BADGE[sr.status]||"bg-slate-100 text-secondary"}`}>{sr.status||"—"}</span>
                  </div>
                  <div className="text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${URGENCY_BADGE[sr.urgency]||"bg-slate-100 text-secondary"}`}>{sr.urgency||"—"}</span>
                  </div>
                  <div className="text-center">
                    {sr.work_order_id ? (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg font-medium">✓ Linked</span>
                    ) : (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-lg">Unlinked</span>
                    )}
                  </div>
                  <div className="text-center text-xs text-tertiary">{fmtDate(sr.created_at)}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
