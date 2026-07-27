"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtDateTime = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}); } catch { return "—"; } };

const P = {critical:"bg-red-100 text-red-800 border-red-200",high:"bg-orange-100 text-orange-800 border-orange-200",medium:"bg-amber-100 text-amber-800 border-amber-200",low:"bg-slate-100 text-slate-600 border-slate-200"};
const ST = {new:"bg-blue-100 text-blue-800",qualified:"bg-indigo-100 text-indigo-800",assigned:"bg-amber-100 text-amber-800",negotiation:"bg-orange-100 text-orange-800",converted:"bg-emerald-100 text-emerald-800",won:"bg-emerald-100 text-emerald-800",lost:"bg-red-100 text-red-700"};
const STATUSES   = ["new","qualified","assigned","negotiation","converted","won","lost"];
const PRIORITIES = ["critical","high","medium","low"];
const SOURCES    = ["web","direct","referral","linkedin","cold_call","event"];

export default function LeadDetailPage() {
  const { id }    = useParams();
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState(null);

  const { data: lead, isLoading, refetch } = useQuery(
    ["lead-detail", id],
    () => authFetch(`/api/v1/leads/${id}`).then(r=>r.json()),
    { enabled: !!id, onSuccess: (d) => { if (!form) setForm(d); } }
  );

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400";

  async function save(e) {
    e.preventDefault(); setSaving(true);
    try {
      const r = await authFetch(`/api/v1/leads/${id}`, {
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
      const r = await authFetch(`/api/v1/leads/${id}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({status})
      });
      if (r.ok) refetch();
      else alert("Failed to update status");
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  if (isLoading) return <PageWrapper><LoadingState /></PageWrapper>;
  if (!lead || lead.detail) return (
    <PageWrapper>
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">Lead not found</p>
        <Link href="/commercial/leads" className="text-blue-600 underline text-sm">Back to Leads</Link>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper>
      <PageHeader
        title={lead.name || "Lead"}
        subtitle={lead.company ? `${lead.company} · ${lead.source||""}` : lead.source||""}
        breadcrumbs={[{label:"Commercial",href:"/commercial"},{label:"Leads",href:"/commercial/leads"},{label:lead.name?.slice(0,30)||id}]}
        actions={
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button variant="secondary" size="sm" onClick={()=>{setForm({...lead});setEditing(true)}}>Edit</Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={()=>setEditing(false)}>Cancel</Button>
                <Button variant="primary" size="sm" loading={saving} onClick={save}>Save Changes</Button>
              </>
            )}
          </div>
        }
      />

      {/* Pipeline status bar */}
      {!editing && (
        <div className="flex items-center gap-2 mb-5 p-4 bg-white border border-slate-200 rounded-xl overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">PIPELINE:</span>
          {STATUSES.map(s=>(
            <button key={s} onClick={()=>updateStatus(s)} disabled={saving||s===lead.status}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shrink-0 ${s===lead.status?"bg-blue-600 text-white border-blue-600":"border-slate-200 bg-white text-slate-600 hover:border-blue-300 disabled:opacity-100"}`}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <SectionCard title="Lead Details">
            {editing ? (
              <form onSubmit={save} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                    <input required value={form?.name||""} onChange={e=>setForm({...form,name:e.target.value})} className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Company</label>
                    <input value={form?.company||""} onChange={e=>setForm({...form,company:e.target.value})} className={inp} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email *</label>
                    <input type="email" required value={form?.email||""} onChange={e=>setForm({...form,email:e.target.value})} className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                    <input value={form?.phone||""} onChange={e=>setForm({...form,phone:e.target.value})} className={inp} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Source</label>
                    <select value={form?.source||"web"} onChange={e=>setForm({...form,source:e.target.value})} className={inp}>
                      {SOURCES.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
                    <select value={form?.priority||"medium"} onChange={e=>setForm({...form,priority:e.target.value})} className={inp}>
                      {PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                    <select value={form?.status||"new"} onChange={e=>setForm({...form,status:e.target.value})} className={inp}>
                      {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                  <textarea value={form?.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}
                    rows={4} placeholder="Requirements, budget, property details…" className={inp+" resize-none"} />
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Contact</p>
                    <p className="text-slate-800 font-medium">{lead.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{lead.email}</p>
                    {lead.phone&&<p className="text-xs text-slate-400">{lead.phone}</p>}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Company</p>
                    <p className="text-slate-700">{lead.company||"—"}</p>
                  </div>
                </div>
                {lead.notes && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap">{lead.notes}</p>
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Lead Score">
            <div className="text-center py-4">
              <div className={`text-5xl font-black mb-1 ${(lead.score||0)>=80?"text-emerald-600":(lead.score||0)>=50?"text-amber-600":"text-slate-400"}`}>
                {lead.score||0}
              </div>
              <p className="text-xs text-slate-500">Lead Score</p>
              <div className="mt-3 w-full bg-slate-100 rounded-full h-2">
                <div className={`h-2 rounded-full ${(lead.score||0)>=80?"bg-emerald-500":(lead.score||0)>=50?"bg-amber-500":"bg-slate-400"}`}
                  style={{width:`${Math.min(100,lead.score||0)}%`}} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Properties">
            <dl className="space-y-3">
              {[
                {label:"Status",   value:<span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold "+(ST[lead.status]||"bg-slate-100 text-slate-600")}>{lead.status||"—"}</span>},
                {label:"Priority", value:<span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border "+(P[lead.priority]||P.low)}>{lead.priority||"—"}</span>},
                {label:"Source",   value:<span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">{lead.source||"—"}</span>},
                {label:"Created",  value:fmtDate(lead.created_at)},
                {label:"Updated",  value:fmtDate(lead.updated_at)},
              ].map(({label,value})=>(
                <div key={label} className="flex justify-between items-center">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="text-xs">{value}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>

          <Link href="/commercial/leads"
            className="block w-full px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-center transition-colors">
            Back to Leads
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
