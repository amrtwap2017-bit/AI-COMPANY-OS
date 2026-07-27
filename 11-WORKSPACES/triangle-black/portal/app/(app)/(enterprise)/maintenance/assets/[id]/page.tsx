"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const STATUSES     = ["Operational","Under Maintenance","In Fault","Decommissioned"];
const CRITICALITY  = ["critical","high","medium","low"];
const CATEGORIES   = ["HVAC","Electrical","Plumbing","Elevator","Fire Safety","BMS","Mechanical","Other"];

const S = {Operational:"bg-emerald-100 text-emerald-800","Under Maintenance":"bg-amber-100 text-amber-800","In Fault":"bg-red-100 text-red-800",Decommissioned:"bg-slate-100 text-slate-500"};
const C = {critical:"bg-red-100 text-red-800 border-red-200",high:"bg-orange-100 text-orange-800 border-orange-200",medium:"bg-amber-100 text-amber-800 border-amber-200",low:"bg-slate-100 text-slate-600 border-slate-200"};

export default function AssetDetailPage() {
  const { id }    = useParams();
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState(null);

  const { data: asset, isLoading, refetch } = useQuery(
    ["asset-detail", id],
    () => authFetch(`/api/v1/assets/${id}`).then(r=>r.json()),
    { enabled: !!id, onSuccess: (d) => { if (!form) setForm(d); } }
  );

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400";

  async function save(e) {
    e.preventDefault(); setSaving(true);
    try {
      const r = await authFetch(`/api/v1/assets/${id}`, {
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
      const r = await authFetch(`/api/v1/assets/${id}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({status})
      });
      if (r.ok) refetch();
      else alert("Failed to update status");
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  if (isLoading) return <PageWrapper><LoadingState /></PageWrapper>;
  if (!asset || asset.detail) return (
    <PageWrapper>
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">Asset not found</p>
        <Link href="/maintenance/assets" className="text-blue-600 underline text-sm">Back to Assets</Link>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper>
      <PageHeader
        title={asset.name || "Asset"}
        subtitle={`${asset.category||"Equipment"} · ${asset.location||"No location"}`}
        breadcrumbs={[{label:"Maintenance",href:"/maintenance"},{label:"Assets",href:"/maintenance/assets"},{label:asset.name?.slice(0,30)||id}]}
        actions={
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button variant="secondary" size="sm" onClick={()=>{setForm({...asset});setEditing(true)}}>Edit</Button>
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
          <span className="text-xs font-semibold text-slate-500 mr-2">STATUS:</span>
          <span className={"inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold "+(S[asset.status]||"bg-slate-100 text-slate-600")}>{asset.status||"—"}</span>
          <div className="flex-1" />
          <span className="text-xs text-slate-400 mr-1">Change to:</span>
          {STATUSES.filter(s=>s!==asset.status).map(s=>(
            <button key={s} onClick={()=>updateStatus(s)} disabled={saving}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:border-blue-400 hover:text-blue-700 transition-colors disabled:opacity-50">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <SectionCard title="Asset Details">
            {editing ? (
              <form onSubmit={save} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Asset Name *</label>
                    <input required value={form?.name||""} onChange={e=>setForm({...form,name:e.target.value})} className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                    <select value={form?.category||"HVAC"} onChange={e=>setForm({...form,category:e.target.value})} className={inp}>
                      {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                    <select value={form?.status||"Operational"} onChange={e=>setForm({...form,status:e.target.value})} className={inp}>
                      {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Criticality</label>
                    <select value={form?.criticality||"medium"} onChange={e=>setForm({...form,criticality:e.target.value})} className={inp}>
                      {CRITICALITY.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
                    <input value={form?.location||""} onChange={e=>setForm({...form,location:e.target.value})} placeholder="e.g. B2 Plant Room" className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Model / Manufacturer</label>
                    <input value={form?.model||""} onChange={e=>setForm({...form,model:e.target.value})} placeholder="Carrier 30XA" className={inp} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                  <textarea value={form?.notes||form?.description||""} onChange={e=>setForm({...form,notes:e.target.value})}
                    rows={3} className={inp+" resize-none"} />
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Category</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">{asset.category||"—"}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Location</p>
                    <p className="text-slate-700">{asset.location||"—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Model</p>
                    <p className="text-slate-700">{asset.model||asset.manufacturer||"—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Serial Number</p>
                    <p className="text-slate-700 font-mono text-xs">{asset.serial_number||"—"}</p>
                  </div>
                </div>
                {(asset.notes||asset.description) && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-slate-700 text-sm">{asset.notes||asset.description}</p>
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Properties">
            <dl className="space-y-3">
              {[
                {label:"Status",      value:<span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold "+(S[asset.status]||"bg-slate-100 text-slate-600")}>{asset.status||"—"}</span>},
                {label:"Criticality", value:<span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border "+(C[asset.criticality]||C.low)}>{asset.criticality||"—"}</span>},
                {label:"Installed",   value:fmtDate(asset.installation_date||asset.created_at)},
                {label:"Last Maint.", value:fmtDate(asset.last_maintenance_date)},
                {label:"Next Maint.", value:fmtDate(asset.next_maintenance_date)},
              ].map(({label,value})=>(
                <div key={label} className="flex justify-between items-center">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="text-xs">{value}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>

          <SectionCard title="Quick Actions">
            <div className="space-y-2">
              {asset.status==="In Fault"&&(
                <button onClick={()=>updateStatus("Under Maintenance")} disabled={saving}
                  className="w-full px-3 py-2 text-sm font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700 disabled:opacity-50">
                  Start Maintenance
                </button>
              )}
              {asset.status==="Under Maintenance"&&(
                <button onClick={()=>updateStatus("Operational")} disabled={saving}
                  className="w-full px-3 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50">
                  Mark Operational
                </button>
              )}
              <Link href="/maintenance/assets" className="block w-full px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-center">Back to Assets</Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}
