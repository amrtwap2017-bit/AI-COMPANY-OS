"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtNum  = (n) => { try { return Number(n||0).toLocaleString(); } catch { return "0"; } };

const S = {active:"bg-emerald-100 text-emerald-800",draft:"bg-slate-100 text-slate-600",pending:"bg-amber-100 text-amber-800",expired:"bg-red-100 text-red-700",terminated:"bg-red-100 text-red-700",completed:"bg-blue-100 text-blue-800"};
const STATUSES = ["active","draft","pending","expired","terminated","completed"];
const TYPES    = ["maintenance","consulting","supply","installation","inspection","annual-service"];

export default function ContractDetailPage() {
  const { id }    = useParams();
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState(null);

  const { data: contract, isLoading, refetch } = useQuery(
    ["contract-detail", id],
    () => authFetch(`/api/v1/contracts/${id}`).then(r=>r.json()),
    { enabled: !!id, onSuccess: (d) => { if (!form) setForm(d); } }
  );

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400";

  async function save(e) {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {...form};
      if (payload.total_value) payload.total_value = Number(payload.total_value);
      const r = await authFetch(`/api/v1/contracts/${id}`, {
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
      const r = await authFetch(`/api/v1/contracts/${id}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({status})
      });
      if (r.ok) refetch();
      else alert("Failed to update status");
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  if (isLoading) return <PageWrapper><LoadingState /></PageWrapper>;
  if (!contract || contract.detail) return (
    <PageWrapper>
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">Contract not found</p>
        <Link href="/commercial/contracts" className="text-blue-600 underline text-sm">Back to Contracts</Link>
      </div>
    </PageWrapper>
  );

  const expiringSoon = contract.end_date && contract.status==="active" &&
    (new Date(contract.end_date)-new Date())/(1000*60*60*24) <= 30;

  return (
    <PageWrapper>
      <PageHeader
        title={contract.title || contract.contract_number || "Contract"}
        subtitle={contract.client_name ? `${contract.client_name} · ${contract.contract_type||""}` : contract.contract_number||""}
        breadcrumbs={[{label:"Commercial",href:"/commercial"},{label:"Contracts",href:"/commercial/contracts"},{label:(contract.title||contract.contract_number||id)?.slice(0,30)}]}
        actions={
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button variant="secondary" size="sm" onClick={()=>{setForm({...contract,total_value:contract.total_value||contract.value||""});setEditing(true)}}>Edit</Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={()=>setEditing(false)}>Cancel</Button>
                <Button variant="primary" size="sm" loading={saving} onClick={save}>Save Changes</Button>
              </>
            )}
          </div>
        }
      />

      {expiringSoon && !editing && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
          <span className="text-amber-500 font-bold text-lg">!</span>
          <p className="text-sm font-semibold text-amber-800">
            This contract expires on {fmtDate(contract.end_date)} — renewal action required
          </p>
        </div>
      )}

      {!editing && (
        <div className="flex items-center gap-3 mb-5 p-4 bg-white border border-slate-200 rounded-xl">
          <span className="text-xs font-semibold text-slate-500 mr-2">STATUS:</span>
          <span className={"inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold "+(S[contract.status]||"bg-slate-100 text-slate-600")}>{contract.status||"—"}</span>
          <div className="flex-1" />
          {STATUSES.filter(s=>s!==contract.status).slice(0,3).map(s=>(
            <button key={s} onClick={()=>updateStatus(s)} disabled={saving}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:border-blue-400 hover:text-blue-700 transition-colors disabled:opacity-50">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <SectionCard title="Contract Details">
            {editing ? (
              <form onSubmit={save} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
                    <input required value={form?.title||""} onChange={e=>setForm({...form,title:e.target.value})} className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Client Name *</label>
                    <input required value={form?.client_name||""} onChange={e=>setForm({...form,client_name:e.target.value})} className={inp} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Contract Number</label>
                    <input value={form?.contract_number||""} onChange={e=>setForm({...form,contract_number:e.target.value})} className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Total Value (EGP)</label>
                    <input type="number" value={form?.total_value||""} onChange={e=>setForm({...form,total_value:e.target.value})} className={inp} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                    <select value={form?.contract_type||"maintenance"} onChange={e=>setForm({...form,contract_type:e.target.value})} className={inp}>
                      {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                    <input type="date" value={form?.start_date?.slice(0,10)||""} onChange={e=>setForm({...form,start_date:e.target.value})} className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                    <input type="date" value={form?.end_date?.slice(0,10)||""} onChange={e=>setForm({...form,end_date:e.target.value})} className={inp} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                  <textarea value={form?.description||""} onChange={e=>setForm({...form,description:e.target.value})}
                    rows={3} className={inp+" resize-none"} />
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Client</p>
                    <p className="text-slate-800 font-medium">{contract.client_name||"—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Contract Number</p>
                    <p className="text-slate-700 font-mono text-xs">{contract.contract_number||"—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Type</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">{contract.contract_type||"—"}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Value</p>
                    <p className="text-slate-800 font-bold">EGP {fmtNum(contract.total_value||contract.value||0)}</p>
                  </div>
                </div>
                {contract.description && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Description</p>
                    <p className="text-slate-700 text-sm">{contract.description}</p>
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Contract Value">
            <div className="text-center py-3">
              <div className="text-3xl font-black text-blue-700 mb-1">EGP {fmtNum(contract.total_value||contract.value||0)}</div>
              <p className="text-xs text-slate-500">Total Contract Value</p>
            </div>
          </SectionCard>

          <SectionCard title="Timeline">
            <dl className="space-y-3">
              {[
                {label:"Status",   value:<span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold "+(S[contract.status]||"bg-slate-100 text-slate-600")}>{contract.status||"—"}</span>},
                {label:"Start",    value:fmtDate(contract.start_date)},
                {label:"End",      value:<span className={expiringSoon?"text-amber-600 font-semibold":""}>{fmtDate(contract.end_date)}{expiringSoon?" ⚠":"" }</span>},
                {label:"Created",  value:fmtDate(contract.created_at)},
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
              {contract.status==="draft"&&<button onClick={()=>updateStatus("active")} disabled={saving} className="w-full px-3 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50">Activate Contract</button>}
              {contract.status==="active"&&<button onClick={()=>updateStatus("completed")} disabled={saving} className="w-full px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50">Mark Completed</button>}
              <Link href="/commercial/contracts" className="block w-full px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-center">Back to Contracts</Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}
