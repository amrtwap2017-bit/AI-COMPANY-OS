"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const STATUSES    = ["active","overdue","inactive","completed"];
const FREQ_OPTS   = ["daily","weekly","monthly","quarterly","biannual","yearly"];
const TYPES       = ["preventive","inspection","corrective","calibration","lubrication"];

const S = {active:"bg-emerald-100 text-emerald-800",overdue:"bg-red-100 text-red-800",inactive:"bg-slate-100 text-secondary",completed:"bg-blue-100 text-blue-800"};

export default function PMPlanDetailPage() {
  const { id }    = useParams();
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState(null);

  const { data: plan, isLoading, refetch } = useQuery(
    ["pmplan-detail", id],
    () => authFetch(`/api/v1/maintenance/pm-plans/${id}`).then(r=>r.json()),
    { enabled: !!id, onSuccess: (d) => { if (!form) setForm(d); } }
  );

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400";

  async function save(e) {
    e.preventDefault(); setSaving(true);
    try {
      const r = await authFetch(`/api/v1/maintenance/pm-plans/${id}`, {
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
      const r = await authFetch(`/api/v1/maintenance/pm-plans/${id}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({status})
      });
      if (r.ok) refetch();
      else alert("Failed to update status");
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  if (isLoading) return <PageWrapper><LoadingState /></PageWrapper>;
  if (!plan || plan.detail) return (
    <PageWrapper>
      <div className="text-center py-20">
        <p className="text-secondary mb-4">PM Plan not found</p>
        <Link href="/maintenance/pm-plans" className="text-blue-600 underline text-sm">Back to PM Plans</Link>
      </div>
    </PageWrapper>
  );

  const isOverdue = plan.next_due_date && new Date(plan.next_due_date) < new Date() && plan.status === "active";
  const isSoon    = plan.next_due_date && !isOverdue && (new Date(plan.next_due_date)-new Date())/(1000*60*60*24) <= 7;

  return (
    <PageWrapper>
      <PageHeader
        title={plan.title || "PM Plan"}
        subtitle={`${plan.plan_type||"preventive"} · ${plan.frequency||""}`}
        breadcrumbs={[{label:"Maintenance",href:"/maintenance"},{label:"PM Plans",href:"/maintenance/pm-plans"},{label:plan.title?.slice(0,30)||id}]}
        actions={
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button variant="secondary" size="sm" onClick={()=>{setForm({...plan});setEditing(true)}}>Edit</Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={()=>setEditing(false)}>Cancel</Button>
                <Button variant="primary" size="sm" loading={saving} onClick={save}>Save Changes</Button>
              </>
            )}
          </div>
        }
      />

      {isOverdue && !editing && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <span className="text-red-500 font-bold">!</span>
          <p className="text-sm font-semibold text-red-800">
            This PM plan is overdue — was due {fmtDate(plan.next_due_date)}. Schedule immediately.
          </p>
        </div>
      )}

      {isSoon && !editing && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
          <span className="text-amber-500 font-bold">!</span>
          <p className="text-sm font-semibold text-amber-800">
            Due soon — scheduled for {fmtDate(plan.next_due_date)}.
          </p>
        </div>
      )}

      {!editing && (
        <div className="flex items-center gap-3 mb-5 p-4 bg-white border border-slate-200 rounded-xl">
          <span className="text-xs font-semibold text-secondary mr-2">STATUS:</span>
          <span className={"inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold "+(S[plan.status]||"bg-slate-100 text-secondary")}>{plan.status||"—"}</span>
          <div className="flex-1" />
          {STATUSES.filter(s=>s!==plan.status).map(s=>(
            <button key={s} onClick={()=>updateStatus(s)} disabled={saving}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:border-blue-400 hover:text-blue-700 transition-colors disabled:opacity-50">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <SectionCard title="Plan Details">
            {editing ? (
              <form onSubmit={save} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Title *</label>
                  <input required value={form?.title||""} onChange={e=>setForm({...form,title:e.target.value})} className={inp} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Type</label>
                    <select value={form?.plan_type||"preventive"} onChange={e=>setForm({...form,plan_type:e.target.value})} className={inp}>
                      {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Frequency</label>
                    <select value={form?.frequency||"monthly"} onChange={e=>setForm({...form,frequency:e.target.value})} className={inp}>
                      {FREQ_OPTS.map(f=><option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Next Due Date</label>
                    <input type="date" value={form?.next_due_date?.slice(0,10)||""} onChange={e=>setForm({...form,next_due_date:e.target.value})} className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Owner</label>
                    <input value={form?.owner||""} onChange={e=>setForm({...form,owner:e.target.value})} className={inp} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Checklist / Notes</label>
                  <textarea value={form?.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}
                    rows={5} placeholder="Step 1: Check refrigerant pressure&#10;Step 2: Inspect belts and bearings&#10;Step 3: Clean filters…" className={inp+" resize-none"} />
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Type</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-secondary">{plan.plan_type||"preventive"}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Owner</p>
                    <p className="text-slate-700">{plan.owner||"—"}</p>
                  </div>
                </div>
                {plan.notes && (
                  <div>
                    <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">Checklist / Notes</p>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-slate-700 text-sm whitespace-pre-wrap font-mono leading-relaxed">{plan.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Schedule">
            <dl className="space-y-3">
              {[
                {label:"Status",    value:<span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold "+(S[plan.status]||"bg-slate-100 text-secondary")}>{plan.status||"—"}</span>},
                {label:"Frequency", value:<span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">{plan.frequency||"—"}</span>},
                {label:"Next Due",  value:<span className={`font-medium ${isOverdue?"text-red-600":isSoon?"text-amber-600":"text-slate-700"}`}>{fmtDate(plan.next_due_date)}{isOverdue?" (OVERDUE)":isSoon?" (SOON)":""}</span>},
                {label:"Last Done", value:fmtDate(plan.last_completed_date)},
                {label:"Created",   value:fmtDate(plan.created_at)},
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
              {plan.status==="active"&&(
                <button onClick={()=>updateStatus("completed")} disabled={saving}
                  className="w-full px-3 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50">
                  Mark as Completed
                </button>
              )}
              {plan.status==="inactive"&&(
                <button onClick={()=>updateStatus("active")} disabled={saving}
                  className="w-full px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50">
                  Activate Plan
                </button>
              )}
              <Link href="/maintenance/pm-plans" className="block w-full px-3 py-2 text-sm font-semibold text-secondary bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-center">Back to PM Plans</Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}
