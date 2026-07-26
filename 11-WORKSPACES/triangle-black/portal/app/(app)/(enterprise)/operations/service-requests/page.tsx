// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
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

const STATUSES  = ["all","open","in_progress","resolved","closed"];
const URGENCIES = ["all","critical","high","medium","low"];
const CATEGORIES = ["all","HVAC","Electrical","Plumbing","Elevator","Fire Safety","BMS","Power","Mechanical","IT"];

export default function ServiceRequestsPage() {
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [urgencyFilter,  setUrgencyFilter]  = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch]   = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating]     = useState(false);
  const [form, setForm] = useState({
    title:"", description:"", category:"HVAC", urgency:"medium",
    submitted_by:"", contact_phone:"",
    hotel_id:"tb-default-hotel-000000000001"
  });

  const { data: raw = [], isLoading, refetch } = useQuery(
    ["service-requests-list"],
    () => authFetch("/api/v1/service-requests/?limit=200").then(r => r.json()),
    { refetchInterval: 60000 }
  );

  const srs = toArr(raw);

  const filtered = srs.filter(s => {
    if (statusFilter   !== "all" && s.status   !== statusFilter)   return false;
    if (urgencyFilter  !== "all" && s.urgency  !== urgencyFilter)  return false;
    if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
    if (search && !s.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const total    = srs.length;
  const open     = srs.filter(s => s.status === "open").length;
  const inProg   = srs.filter(s => s.status === "in_progress").length;
  const resolved = srs.filter(s => s.status === "resolved").length;
  const critical = srs.filter(s => s.urgency === "critical").length;

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const r = await authFetch("/api/v1/service-requests/", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form)
      });
      if (r.ok) { setShowCreate(false); setForm({title:"",description:"",category:"HVAC",urgency:"medium",submitted_by:"",contact_phone:"",hotel_id:"tb-default-hotel-000000000001"}); refetch(); }
      else { const err = await r.json().catch(()=>{}); alert(err?.detail || "Failed to create service request"); }
    } catch(e) { alert("Network error"); }
    finally { setCreating(false); }
  }

  const U_COLOR = {
    critical:"bg-red-100 text-red-800 border border-red-200",
    high:"bg-orange-100 text-orange-800 border border-orange-200",
    medium:"bg-amber-100 text-amber-800 border border-amber-200",
    low:"bg-slate-100 text-slate-600 border border-slate-200",
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Service Requests"
        subtitle={`${total} total · ${open} open · ${critical} critical`}
        breadcrumbs={[{label:"Operations",href:"/operations"},{label:"Service Requests"}]}
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)} icon="＋">
            New Request
          </Button>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {[
          {label:"Total",    value:total,    color:"text-slate-800"},
          {label:"Open",     value:open,     color:"text-blue-700"},
          {label:"In Progress",value:inProg, color:"text-indigo-700"},
          {label:"Resolved", value:resolved, color:"text-emerald-700"},
          {label:"Critical", value:critical, color:"text-red-700"},
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading ? "…" : k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <SectionCard title={`Service Requests (${filtered.length})`}>
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search requests…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {STATUSES.map(s => <option key={s} value={s}>{s==="all"?"All Status":s.replace("_"," ")}</option>)}
          </select>
          <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {URGENCIES.map(u => <option key={u} value={u}>{u==="all"?"All Urgency":u}</option>)}
          </select>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {CATEGORIES.map(c => <option key={c} value={c}>{c==="all"?"All Categories":c}</option>)}
          </select>
          {(statusFilter!=="all"||urgencyFilter!=="all"||categoryFilter!=="all"||search) && (
            <button onClick={()=>{setStatusFilter("all");setUrgencyFilter("all");setCategoryFilter("all");setSearch("");}}
              className="text-xs text-slate-500 hover:text-red-600 underline">Clear</button>
          )}
        </div>

        {isLoading ? <LoadingState /> : filtered.length === 0 ? (
          <EmptyState title="No service requests found" subtitle="Try adjusting your filters or create a new request" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Urgency</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Submitted By</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(sr => (
                  <tr key={sr.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-800 truncate max-w-xs">{sr.title}</p>
                      {sr.description && <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5">{sr.description}</p>}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">{sr.category||"—"}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold "+(U_COLOR[sr.urgency?.toLowerCase()]||U_COLOR.low)}>
                        {sr.urgency||"—"}
                      </span>
                    </td>
                    <td className="py-3 px-3"><SBadge v={sr.status} /></td>
                    <td className="py-3 px-3 text-xs text-slate-500">{sr.submitted_by||"—"}</td>
                    <td className="py-3 px-3 text-xs text-slate-400">{fmtDate(sr.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Service Request" size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={creating} onClick={handleCreate}>Submit Request</Button>
          </div>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
            <input required value={form.title} onChange={e => setForm({...form,title:e.target.value})}
              placeholder="e.g. AC Breakdown Room 205"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})}
              rows={3} placeholder="Describe the issue in detail…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({...form,category:e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                {CATEGORIES.filter(c=>c!=="all").map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Urgency</label>
              <select value={form.urgency} onChange={e => setForm({...form,urgency:e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                {URGENCIES.filter(u=>u!=="all").map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Submitted By</label>
              <input value={form.submitted_by} onChange={e => setForm({...form,submitted_by:e.target.value})}
                placeholder="Your name"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Phone</label>
              <input value={form.contact_phone} onChange={e => setForm({...form,contact_phone:e.target.value})}
                placeholder="+20 10 0000 0000"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
