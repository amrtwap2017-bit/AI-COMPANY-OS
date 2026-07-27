// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";
import { Button } from "@/components/ui/Button";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtNum  = (n) => { try { return Number(n||0).toLocaleString(); } catch { return "0"; } };

const S = {active:"bg-emerald-100 text-emerald-800",draft:"bg-slate-100 text-slate-600",pending:"bg-amber-100 text-amber-800",expired:"bg-red-100 text-red-700",terminated:"bg-red-100 text-red-700",completed:"bg-blue-100 text-blue-800"};
const STATUSES = ["all","active","draft","pending","expired","terminated","completed"];
const TYPES    = ["maintenance","consulting","supply","installation","inspection","annual-service"];

export default function ContractsPage() {
  const [q,  setQ]  = useState("");
  const [sf, setSf] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [form, setForm] = useState({
    title:"", client_name:"", contract_number:"",
    contract_type:"maintenance", total_value:"",
    start_date:"", end_date:"", status:"draft",
    description:"", hotel_id:"tb-default-hotel-000000000001"
  });

  const { data: raw=[], isLoading, refetch } = useQuery(
    ["contracts-list"],
    () => authFetch("/api/v1/contracts/?limit=200").then(r=>r.json()),
    { refetchInterval: 120000 }
  );

  const contracts = toArr(raw);
  const filtered  = contracts.filter(c => {
    if (sf!=="all" && c.status!==sf) return false;
    if (q && !(c.title?.toLowerCase().includes(q.toLowerCase()) || c.client_name?.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const total    = contracts.length;
  const active   = contracts.filter(c=>c.status==="active").length;
  const expiring = contracts.filter(c=>{
    if (!c.end_date||c.status!=="active") return false;
    try { return (new Date(c.end_date)-new Date())/(1000*60*60*24)<=30; } catch { return false; }
  }).length;
  const totalVal = contracts.filter(c=>c.status==="active").reduce((s,c)=>s+(c.total_value||c.value||0),0);

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400";

  async function save(e) {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {...form};
      if (payload.total_value) payload.total_value = Number(payload.total_value);
      else delete payload.total_value;
      if (!payload.start_date)    delete payload.start_date;
      if (!payload.end_date)      delete payload.end_date;
      if (!payload.description)   delete payload.description;
      if (!payload.contract_number) delete payload.contract_number;
      const r = await authFetch("/api/v1/contracts/", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      });
      if (r.ok) {
        setShowCreate(false);
        setForm({title:"",client_name:"",contract_number:"",contract_type:"maintenance",total_value:"",start_date:"",end_date:"",status:"draft",description:"",hotel_id:"tb-default-hotel-000000000001"});
        refetch();
      } else {
        const err = await r.json().catch(()=>({}));
        alert(err?.detail || "Failed to create contract");
      }
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Contracts"
        subtitle={`${total} contracts · ${active} active · ${expiring} expiring soon`}
        breadcrumbs={[{label:"Commercial",href:"/commercial"},{label:"Contracts"}]}
        actions={<Button variant="primary" size="sm" onClick={()=>setShowCreate(true)}>+ New Contract</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Total",          value:total,    color:"text-slate-800"},
          {label:"Active",         value:active,   color:"text-emerald-700"},
          {label:"Expiring (30d)", value:expiring, color:expiring>0?"text-amber-700":"text-slate-500"},
          {label:"Active Value",   value:`EGP ${fmtNum(totalVal)}`, color:"text-blue-700"},
        ].map(k=>(
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading?"…":k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <SectionCard title={`Contracts (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search contract or client…" value={q}
            onChange={e=>setQ(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:border-blue-400" />
          <select value={sf} onChange={e=>setSf(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {STATUSES.map(s=><option key={s} value={s}>{s==="all"?"All Status":s}</option>)}
          </select>
          {(sf!=="all"||q)&&<button onClick={()=>{setSf("all");setQ("");}} className="text-xs text-slate-400 hover:text-red-500 underline">Clear</button>}
        </div>
        {isLoading?<LoadingState/>:filtered.length===0?<EmptyState title="No contracts found"
          action={<Button variant="primary" size="sm" onClick={()=>setShowCreate(true)}>Create Contract</Button>}
        />:(
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                {["Contract","Client","Value","Status","Start","End"].map(h=>(
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(c=>{
                  const expiringSoon = c.end_date&&c.status==="active"&&(new Date(c.end_date)-new Date())/(1000*60*60*24)<=30;
                  return (
                    <tr key={c.id} className={`hover:bg-slate-50 transition-colors ${expiringSoon?"bg-amber-50/30":""}`}>
                      <td className="py-3 px-3">
                        <p className="font-medium text-slate-800 truncate max-w-[180px]">{c.title||c.contract_number||"—"}</p>
                        <p className="text-xs text-slate-400">{c.contract_number||c.reference||""}</p>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-600">{c.client_name||"—"}</td>
                      <td className="py-3 px-3"><span className="font-semibold text-slate-800">EGP {fmtNum(c.total_value||c.value||0)}</span></td>
                      <td className="py-3 px-3">
                        <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold "+(S[c.status]||"bg-slate-100 text-slate-600")}>{c.status||"—"}</span>
                        {expiringSoon&&<span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1 rounded font-semibold">EXPIRING</span>}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-400">{fmtDate(c.start_date)}</td>
                      <td className={`py-3 px-3 text-xs font-medium ${expiringSoon?"text-amber-600":"text-slate-400"}`}>{fmtDate(c.end_date)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {showCreate&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <h2 className="font-bold text-slate-900">New Contract</h2>
              <button onClick={()=>setShowCreate(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none">x</button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
                  <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
                    placeholder="e.g. Annual HVAC Maintenance" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Client Name *</label>
                  <input required value={form.client_name} onChange={e=>setForm({...form,client_name:e.target.value})}
                    placeholder="Hotel or company name" className={inp} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Contract Number</label>
                  <input value={form.contract_number} onChange={e=>setForm({...form,contract_number:e.target.value})}
                    placeholder="CON-2026-0001" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Total Value (EGP)</label>
                  <input type="number" value={form.total_value} onChange={e=>setForm({...form,total_value:e.target.value})}
                    placeholder="120000" className={inp} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                  <select value={form.contract_type} onChange={e=>setForm({...form,contract_type:e.target.value})} className={inp}>
                    {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className={inp}>
                    {STATUSES.filter(s=>s!=="all").map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                  <input type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                  <input type="date" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
                  rows={2} placeholder="Scope of work, services included…" className={inp+" resize-none"} />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={()=>setShowCreate(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50">{saving?"Saving…":"Create Contract"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
