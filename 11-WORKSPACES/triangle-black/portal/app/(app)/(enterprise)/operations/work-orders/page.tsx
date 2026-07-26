// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import Link from "next/link";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState, Modal } from "@/components/ui";
import { Button } from "@/components/ui/Button";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return String(d).slice(0,10); } };
const fmtDateTime = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}); } catch { return "—"; } };

const P_COLOR = {
  critical: "bg-red-100 text-red-800 border border-red-200",
  high:     "bg-orange-100 text-orange-800 border border-orange-200",
  medium:   "bg-amber-100 text-amber-800 border border-amber-200",
  low:      "bg-slate-100 text-slate-600 border border-slate-200",
};
const S_COLOR = {
  open:        "bg-blue-100 text-blue-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  completed:   "bg-emerald-100 text-emerald-800",
  cancelled:   "bg-slate-100 text-slate-500",
  resolved:    "bg-emerald-100 text-emerald-800",
  closed:      "bg-slate-100 text-slate-500",
};
function PBadge({v}) {
  return <span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold "+(P_COLOR[v?.toLowerCase()]||P_COLOR.low)}>{v||"—"}</span>;
}
function SBadge({v}) {
  return <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold "+(S_COLOR[v?.toLowerCase()]||"bg-slate-100 text-slate-600")}>{v?.replace("_"," ")||"—"}</span>;
}

const STATUSES = ["all","open","in_progress","completed","cancelled"];
const PRIORITIES = ["all","critical","high","medium","low"];
const TYPES = ["all","corrective","preventive","inspection","emergency"];

export default function WorkOrdersPage() {
  const [statusFilter, setStatusFilter]     = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch]                 = useState("");
  const [showCreate, setShowCreate]         = useState(false);
  const [creating, setCreating]             = useState(false);
  const [form, setForm] = useState({
    title:"", description:"", type:"corrective", priority:"medium",
    estimated_hours:"2", hotel_id:"tb-default-hotel-000000000001"
  });

  const { data: raw = [], isLoading, refetch } = useQuery(
    ["work-orders-list"],
    () => authFetch("/api/v1/work-orders/?limit=200").then(r => r.json()),
    { refetchInterval: 60000 }
  );

  const { data: techRaw = [] } = useQuery(
    ["technicians-list"],
    () => authFetch("/api/v1/technicians/?limit=100").then(r => r.json())
  );

  const wos   = toArr(raw);
  const techs = toArr(techRaw);

  const filtered = wos.filter(w => {
    if (statusFilter   !== "all" && w.status   !== statusFilter)   return false;
    if (priorityFilter !== "all" && w.priority !== priorityFilter) return false;
    if (search && !w.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const total     = wos.length;
  const open      = wos.filter(w => w.status === "open").length;
  const inProg    = wos.filter(w => w.status === "in_progress").length;
  const completed = wos.filter(w => w.status === "completed").length;
  const critical  = wos.filter(w => w.priority === "critical" && w.status !== "completed").length;

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const r = await authFetch("/api/v1/work-orders/", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({...form, estimated_hours: Number(form.estimated_hours)||2})
      });
      if (r.ok) { setShowCreate(false); setForm({title:"",description:"",type:"corrective",priority:"medium",estimated_hours:"2",hotel_id:"tb-default-hotel-000000000001"}); refetch(); }
      else { alert("Failed to create work order. Check all fields."); }
    } catch(e) { alert("Network error"); }
    finally { setCreating(false); }
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Work Orders"
        subtitle={`${total} total · ${open} open · ${critical} critical`}
        breadcrumbs={[{label:"Operations",href:"/operations"},{label:"Work Orders"}]}
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)} icon="＋">
            New Work Order
          </Button>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {[
          {label:"Total",     value:total,     color:"text-slate-800"},
          {label:"Open",      value:open,      color:"text-blue-700"},
          {label:"In Progress",value:inProg,   color:"text-indigo-700"},
          {label:"Completed", value:completed, color:"text-emerald-700"},
          {label:"Critical",  value:critical,  color:"text-red-700"},
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading ? "…" : k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <SectionCard title={`Work Orders (${filtered.length})`}>
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input
            type="text" placeholder="Search work orders…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:border-blue-400"
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {STATUSES.map(s => <option key={s} value={s}>{s === "all" ? "All Status" : s.replace("_"," ")}</option>)}
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {PRIORITIES.map(p => <option key={p} value={p}>{p === "all" ? "All Priority" : p}</option>)}
          </select>
          {(statusFilter !== "all" || priorityFilter !== "all" || search) && (
            <button onClick={() => {setStatusFilter("all");setPriorityFilter("all");setSearch("");}}
              className="text-xs text-slate-500 hover:text-red-600 underline">Clear filters</button>
          )}
        </div>

        {isLoading ? <LoadingState /> : filtered.length === 0 ? (
          <EmptyState title="No work orders found" subtitle="Try adjusting your filters or create a new work order" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Priority</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Created</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Hrs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(wo => (
                  <tr key={wo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-800 truncate max-w-xs">{wo.title}</p>
                      {wo.description && <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5">{wo.description}</p>}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">{wo.type||"—"}</span>
                    </td>
                    <td className="py-3 px-3"><PBadge v={wo.priority} /></td>
                    <td className="py-3 px-3"><SBadge v={wo.status} /></td>
                    <td className="py-3 px-3 text-xs text-slate-400">{fmtDate(wo.created_at)}</td>
                    <td className="py-3 px-3 text-xs text-slate-500">{wo.estimated_hours || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Work Order" size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={creating} onClick={handleCreate}>Create Work Order</Button>
          </div>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
            <input required value={form.title} onChange={e => setForm({...form,title:e.target.value})}
              placeholder="e.g. Chiller Unit 1 — Refrigerant Recharge"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})}
              rows={3} placeholder="Describe the work required…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({...form,type:e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                {TYPES.filter(t=>t!=="all").map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form,priority:e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                {PRIORITIES.filter(p=>p!=="all").map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Estimated Hours</label>
            <input type="number" min="0.5" step="0.5" value={form.estimated_hours}
              onChange={e => setForm({...form,estimated_hours:e.target.value})}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
