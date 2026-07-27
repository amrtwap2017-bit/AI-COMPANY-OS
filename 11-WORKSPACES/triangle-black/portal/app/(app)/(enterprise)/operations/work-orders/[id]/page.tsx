"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtDateTime = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}); } catch { return "—"; } };

const P = {critical:"bg-red-100 text-red-800 border-red-200",high:"bg-orange-100 text-orange-800 border-orange-200",medium:"bg-amber-100 text-amber-800 border-amber-200",low:"bg-slate-100 text-secondary border-slate-200"};
const S = {open:"bg-blue-100 text-blue-800",in_progress:"bg-indigo-100 text-indigo-800",completed:"bg-emerald-100 text-emerald-800",cancelled:"bg-slate-100 text-secondary"};
const STATUSES   = ["open","in_progress","completed","cancelled"];
const PRIORITIES = ["critical","high","medium","low"];
const TYPES      = ["corrective","preventive","inspection","emergency"];

export default function WorkOrderDetailPage() {
  const { id }    = useParams();
  const router    = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState(null);

  const { data: wo, isLoading, refetch } = useQuery(
    ["wo-detail", id],
    () => authFetch(`/api/v1/work-orders/${id}`).then(r=>r.json()),
    { enabled: !!id, onSuccess: (d) => { if (!form) setForm(d); } }
  );

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400";

  async function save(e) {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {...form};
      if (payload.estimated_hours) payload.estimated_hours = Number(payload.estimated_hours);
      const r = await authFetch(`/api/v1/work-orders/${id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      });
      if (r.ok) { setEditing(false); refetch(); }
      else { const err = await r.json().catch(()=>{}); alert(err?.detail||"Failed to update"); }
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  async function updateStatus(status) {
    setSaving(true);
    try {
      const r = await authFetch(`/api/v1/work-orders/${id}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({status})
      });
      if (r.ok) { refetch(); }
      else { alert("Failed to update status"); }
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  if (isLoading) return <PageWrapper><LoadingState /></PageWrapper>;
  if (!wo || wo.detail) return (
    <PageWrapper>
      <div className="text-center py-20">
        <p className="text-secondary mb-4">Work order not found</p>
        <Link href="/operations/work-orders" className="text-blue-600 underline text-sm">Back to Work Orders</Link>
      </div>
    </PageWrapper>
  );

  const item = editing ? form : wo;

  return (
    <PageWrapper>
      <PageHeader
        title={wo.title || "Work Order"}
        subtitle={`${wo.type || "maintenance"} · Created ${fmtDate(wo.created_at)}`}
        breadcrumbs={[{label:"Operations",href:"/operations"},{label:"Work Orders",href:"/operations/work-orders"},{label:wo.title?.slice(0,30)||id}]}
        actions={
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button variant="secondary" size="sm" onClick={()=>{setForm({...wo});setEditing(true)}}>Edit</Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={()=>setEditing(false)}>Cancel</Button>
                <Button variant="primary" size="sm" loading={saving} onClick={save}>Save Changes</Button>
              </>
            )}
          </div>
        }
      />

      {/* Status action bar */}
      {!editing && (
        <div className="flex items-center gap-3 mb-5 p-4 bg-white border border-slate-200 rounded-xl">
          <span className="text-xs font-semibold text-secondary mr-2">STATUS:</span>
          <span className={"inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold "+(S[wo.status]||"bg-slate-100 text-secondary")}>{wo.status?.replace(/_/g," ")||"—"}</span>
          <div className="flex-1" />
          <span className="text-xs text-tertiary mr-1">Move to:</span>
          {STATUSES.filter(s=>s!==wo.status).map(s=>(
            <button key={s} onClick={()=>updateStatus(s)} disabled={saving}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:border-blue-400 hover:text-blue-700 transition-colors disabled:opacity-50">
              {s.replace(/_/g," ")}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Main details */}
        <div className="xl:col-span-2 space-y-4">
          <SectionCard title="Work Order Details">
            {editing ? (
              <form onSubmit={save} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Title *</label>
                  <input required value={form?.title||""} onChange={e=>setForm({...form,title:e.target.value})} className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Description</label>
                  <textarea value={form?.description||""} onChange={e=>setForm({...form,description:e.target.value})}
                    rows={4} className={inp+" resize-none"} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Type</label>
                    <select value={form?.type||"corrective"} onChange={e=>setForm({...form,type:e.target.value})} className={inp}>
                      {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Priority</label>
                    <select value={form?.priority||"medium"} onChange={e=>setForm({...form,priority:e.target.value})} className={inp}>
                      {PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Status</label>
                    <select value={form?.status||"open"} onChange={e=>setForm({...form,status:e.target.value})} className={inp}>
                      {STATUSES.map(s=><option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Est. Hours</label>
                    <input type="number" value={form?.estimated_hours||""} onChange={e=>setForm({...form,estimated_hours:e.target.value})} className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Due Date</label>
                    <input type="date" value={form?.due_date?.slice(0,10)||""} onChange={e=>setForm({...form,due_date:e.target.value})} className={inp} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Notes</label>
                  <textarea value={form?.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}
                    rows={3} placeholder="Completion notes, observations…" className={inp+" resize-none"} />
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Title</p>
                  <p className="text-slate-800 font-medium">{wo.title}</p>
                </div>
                {wo.description && (
                  <div>
                    <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Description</p>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap">{wo.description}</p>
                  </div>
                )}
                {wo.notes && (
                  <div>
                    <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap">{wo.notes}</p>
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <SectionCard title="Properties">
            <dl className="space-y-3">
              {[
                {label:"Priority",  value:<span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border "+(P[wo.priority]||P.low)}>{wo.priority||"—"}</span>},
                {label:"Type",      value:<span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-secondary">{wo.type||"—"}</span>},
                {label:"Est. Hours",value:wo.estimated_hours?`${wo.estimated_hours}h`:"—"},
                {label:"Due Date",  value:fmtDate(wo.due_date)},
                {label:"Created",   value:fmtDateTime(wo.created_at)},
                {label:"Updated",   value:fmtDateTime(wo.updated_at)},
                {label:"Completed", value:fmtDateTime(wo.completed_at)},
              ].map(({label,value})=>(
                <div key={label} className="flex justify-between items-start">
                  <dt className="text-xs text-secondary font-medium">{label}</dt>
                  <dd className="text-xs text-slate-800 font-semibold text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>

          <SectionCard title="Quick Actions">
            <div className="space-y-2">
              {wo.status === "open" && (
                <button onClick={()=>updateStatus("in_progress")} disabled={saving}
                  className="w-full px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                  Start Work
                </button>
              )}
              {wo.status === "in_progress" && (
                <button onClick={()=>updateStatus("completed")} disabled={saving}
                  className="w-full px-3 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                  Mark Complete
                </button>
              )}
              {!["completed","cancelled"].includes(wo.status) && (
                <button onClick={()=>updateStatus("cancelled")} disabled={saving}
                  className="w-full px-3 py-2 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors">
                  Cancel Work Order
                </button>
              )}
              <Link href="/operations/work-orders"
                className="block w-full px-3 py-2 text-sm font-semibold text-secondary bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-center transition-colors">
                Back to List
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}
