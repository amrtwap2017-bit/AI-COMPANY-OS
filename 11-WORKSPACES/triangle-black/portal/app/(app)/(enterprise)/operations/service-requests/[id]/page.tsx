"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const U = {critical:"bg-red-100 text-red-800 border-red-200",high:"bg-orange-100 text-orange-800 border-orange-200",medium:"bg-amber-100 text-amber-800 border-amber-200",low:"bg-slate-100 text-secondary border-slate-200"};
const S = {open:"bg-blue-100 text-blue-800",in_progress:"bg-indigo-100 text-indigo-800",resolved:"bg-emerald-100 text-emerald-800",closed:"bg-slate-100 text-secondary"};
const STATUSES   = ["open","in_progress","resolved","closed"];
const URGENCIES  = ["critical","high","medium","low"];
const CATEGORIES = ["HVAC","Electrical","Plumbing","Elevator","Fire Safety","BMS","Power","Mechanical","IT"];

export default function ServiceRequestDetailPage() {
  const { id }    = useParams();
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState(null);

  const { data: sr, isLoading, refetch } = useQuery(
    ["sr-detail", id],
    () => authFetch(`/api/v1/service-requests/${id}`).then(r=>r.json()),
    { enabled: !!id, onSuccess: (d) => { if (!form) setForm(d); } }
  );

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400";

  async function save(e) {
    e.preventDefault(); setSaving(true);
    try {
      const r = await authFetch(`/api/v1/service-requests/${id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form)
      });
      if (r.ok) { setEditing(false); refetch(); }
      else { const err = await r.json().catch(()=>{}); alert(err?.detail||"Failed to update"); }
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  async function updateStatus(status) {
    setSaving(true);
    try {
      const r = await authFetch(`/api/v1/service-requests/${id}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({status})
      });
      if (r.ok) refetch();
      else alert("Failed to update status");
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  if (isLoading) return <PageWrapper><LoadingState /></PageWrapper>;
  if (!sr || sr.detail) return (
    <PageWrapper>
      <div className="text-center py-20">
        <p className="text-secondary mb-4">Service request not found</p>
        <Link href="/operations/service-requests" className="text-blue-600 underline text-sm">Back to Service Requests</Link>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper>
      <PageHeader
        title={sr.title || "Service Request"}
        subtitle={`${sr.category||"General"} · Submitted ${fmtDate(sr.created_at)}`}
        breadcrumbs={[{label:"Operations",href:"/operations"},{label:"Service Requests",href:"/operations/service-requests"},{label:sr.title?.slice(0,30)||id}]}
        actions={
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button variant="secondary" size="sm" onClick={()=>{setForm({...sr});setEditing(true)}}>Edit</Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={()=>setEditing(false)}>Cancel</Button>
                <Button variant="primary" size="sm" loading={saving} onClick={save}>Save Changes</Button>
              </>
            )}
          </div>
        }
      />

      {!editing && (
        <div className="flex items-center gap-3 mb-5 p-4 bg-white border border-slate-200 rounded-xl">
          <span className="text-xs font-semibold text-secondary mr-2">STATUS:</span>
          <span className={"inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold "+(S[sr.status]||"bg-slate-100 text-secondary")}>{sr.status?.replace(/_/g," ")||"—"}</span>
          <div className="flex-1" />
          <span className="text-xs text-tertiary mr-1">Move to:</span>
          {STATUSES.filter(s=>s!==sr.status).map(s=>(
            <button key={s} onClick={()=>updateStatus(s)} disabled={saving}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:border-blue-400 hover:text-blue-700 transition-colors disabled:opacity-50">
              {s.replace(/_/g," ")}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <SectionCard title="Request Details">
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Category</label>
                    <select value={form?.category||"HVAC"} onChange={e=>setForm({...form,category:e.target.value})} className={inp}>
                      {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Urgency</label>
                    <select value={form?.urgency||"medium"} onChange={e=>setForm({...form,urgency:e.target.value})} className={inp}>
                      {URGENCIES.map(u=><option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Submitted By</label>
                    <input value={form?.submitted_by||""} onChange={e=>setForm({...form,submitted_by:e.target.value})} className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Contact Phone</label>
                    <input value={form?.contact_phone||""} onChange={e=>setForm({...form,contact_phone:e.target.value})} className={inp} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Resolution Notes</label>
                  <textarea value={form?.resolution_notes||""} onChange={e=>setForm({...form,resolution_notes:e.target.value})}
                    rows={3} placeholder="How was this resolved?" className={inp+" resize-none"} />
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Title</p>
                  <p className="text-slate-800 font-medium">{sr.title}</p>
                </div>
                {sr.description && (
                  <div>
                    <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Description</p>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap">{sr.description}</p>
                  </div>
                )}
                {sr.resolution_notes && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Resolution Notes</p>
                    <p className="text-emerald-800 text-sm">{sr.resolution_notes}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Submitted By</p>
                    <p className="text-slate-700">{sr.submitted_by||"—"}</p>
                    {sr.contact_phone&&<p className="text-xs text-tertiary mt-0.5">{sr.contact_phone}</p>}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Location</p>
                    <p className="text-slate-700">{sr.location||sr.site_id||"—"}</p>
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Properties">
            <dl className="space-y-3">
              {[
                {label:"Urgency",   value:<span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border "+(U[sr.urgency?.toLowerCase()]||U.low)}>{sr.urgency||"—"}</span>},
                {label:"Category",  value:<span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">{sr.category||"—"}</span>},
                {label:"Status",    value:<span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold "+(S[sr.status]||"bg-slate-100 text-secondary")}>{sr.status?.replace(/_/g," ")||"—"}</span>},
                {label:"Created",   value:fmtDate(sr.created_at)},
                {label:"Resolved",  value:fmtDate(sr.resolved_at)},
              ].map(({label,value})=>(
                <div key={label} className="flex justify-between items-center">
                  <dt className="text-xs text-secondary">{label}</dt>
                  <dd className="text-xs">{value}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>

          <SectionCard title="Quick Actions">
            <div className="space-y-2">
              {sr.status==="open"&&<button onClick={()=>updateStatus("in_progress")} disabled={saving} className="w-full px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50">Assign & Start</button>}
              {sr.status==="in_progress"&&<button onClick={()=>updateStatus("resolved")} disabled={saving} className="w-full px-3 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50">Mark Resolved</button>}
              {sr.status==="resolved"&&<button onClick={()=>updateStatus("closed")} disabled={saving} className="w-full px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 disabled:opacity-50">Close Request</button>}
              <Link href="/operations/service-requests" className="block w-full px-3 py-2 text-sm font-semibold text-secondary bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-center">Back to List</Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}
