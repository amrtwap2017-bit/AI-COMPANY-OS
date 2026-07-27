// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useRole } from "@/lib/hooks/useCurrentUser";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const P = {critical:"bg-red-100 text-red-800 border-red-200",high:"bg-orange-100 text-orange-800 border-orange-200",medium:"bg-amber-100 text-amber-800 border-amber-200",low:"bg-slate-100 text-slate-600 border-slate-200"};
const S = {open:"bg-blue-100 text-blue-800",in_progress:"bg-indigo-100 text-indigo-800",completed:"bg-emerald-100 text-emerald-800",cancelled:"bg-slate-100 text-slate-500"};
const STATUSES   = ["all","open","in_progress","completed","cancelled"];
const PRIORITIES = ["all","critical","high","medium","low"];
const TYPES      = ["corrective","preventive","inspection","emergency"];

export default function WorkOrdersPage() {
  const { canCreate, isAdmin } = useRole();
  const [q,  setQ]  = useState("");
  const [sf, setSf] = useState("all");
  const [pf, setPf] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title:"", description:"", type:"corrective", priority:"medium",
    estimated_hours:"2", hotel_id:"tb-default-hotel-000000000001"
  });

  const { data: raw=[], isLoading, refetch } = useQuery(
    ["work-orders-list"],
    () => authFetch("/api/v1/work-orders/?limit=200").then(r=>r.json()),
    { refetchInterval: 30000 }
  );

  const wos = toArr(raw);
  const filtered = wos.filter(w => {
    if (sf!=="all"&&w.status!==sf) return false;
    if (pf!=="all"&&w.priority!==pf) return false;
    if (q&&!w.title?.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const total     = wos.length;
  const open      = wos.filter(w=>w.status==="open").length;
  const inProg    = wos.filter(w=>w.status==="in_progress").length;
  const critical  = wos.filter(w=>w.priority==="critical"&&!["completed","cancelled"].includes(w.status)).length;
  const completed = wos.filter(w=>w.status==="completed").length;

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400";

  async function save(e) {
    e.preventDefault(); setSaving(true);
    try {
      const r = await authFetch("/api/v1/work-orders/", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({...form, estimated_hours: Number(form.estimated_hours)||2})
      });
      if (r.ok) {
        setShowCreate(false);
        setForm({title:"",description:"",type:"corrective",priority:"medium",estimated_hours:"2",hotel_id:"tb-default-hotel-000000000001"});
        refetch();
      } else {
        const err = await r.json().catch(()=>({}));
        alert(err?.detail||"Failed to create work order");
      }
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Work Orders"
        subtitle={`${total} total · ${open} open · ${critical} critical`}
        breadcrumbs={[{label:"Operations",href:"/operations"},{label:"Work Orders"}]}
        actions={canCreate ? <Button variant="primary" size="sm" onClick={()=>setShowCreate(true)}>+ New Work Order</Button> : undefined}
      />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {[
          {label:"Total",      value:total,     color:"text-slate-800"},
          {label:"Open",       value:open,      color:"text-blue-700"},
          {label:"In Progress",value:inProg,    color:"text-indigo-700"},
          {label:"Critical",   value:critical,  color:critical>0?"text-red-700":"text-slate-500"},
          {label:"Completed",  value:completed, color:"text-emerald-700"},
        ].map(k=>(
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading?"…":k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {!isLoading&&critical>0&&(
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <span className="text-red-600 font-bold">!</span>
          <p className="text-sm font-semibold text-red-800">{critical} critical work order{critical>1?"s":""} require immediate attention</p>
        </div>
      )}

      <SectionCard title={`Work Orders (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search work orders…" value={q}
            onChange={e=>setQ(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:border-blue-400" />
          <select value={sf} onChange={e=>setSf(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {STATUSES.map(s=><option key={s} value={s}>{s==="all"?"All Status":s.replace("_"," ")}</option>)}
          </select>
          <select value={pf} onChange={e=>setPf(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {PRIORITIES.map(p=><option key={p} value={p}>{p==="all"?"All Priority":p}</option>)}
          </select>
          {(sf!=="all"||pf!=="all"||q)&&<button onClick={()=>{setSf("all");setPf("all");setQ("");}} className="text-xs text-slate-400 hover:text-red-500 underline">Clear</button>}
        </div>
        {isLoading?<LoadingState/>:filtered.length===0?<EmptyState title="No work orders found"
          action={<Button variant="primary" size="sm" onClick={()=>setShowCreate(true)}>Create Work Order</Button>}
        />:(
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                {["Work Order","Type","Priority","Status","Est. Hours","Date"].map(h=>(
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(w=>(
                  <tr key={w.id} className={`hover:bg-slate-50 hover:cursor-pointer transition-colors ${w.priority==="critical"?"bg-red-50/30":""}`}>
                    <td className="py-3 px-3">
                      <Link href={`/operations/work-orders/${w.id}`}><p className="font-medium text-blue-700 hover:underline truncate max-w-xs">{w.title}</p></Link>
                      {w.description&&<p className="text-xs text-slate-400 truncate">{w.description?.slice(0,55)}</p>}
                    </td>
                    <td className="py-3 px-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">{w.type||"maintenance"}</span></td>
                    <td className="py-3 px-3"><span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border "+(P[w.priority]||P.low)}>{w.priority||"—"}</span></td>
                    <td className="py-3 px-3"><span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold "+(S[w.status]||"bg-slate-100 text-slate-600")}>{w.status?.replace(/_/g," ")||"—"}</span></td>
                    <td className="py-3 px-3 text-xs text-slate-500">{w.estimated_hours||"—"}h</td>
                    <td className="py-3 px-3 text-xs text-slate-400">{fmtDate(w.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {showCreate&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">New Work Order</h2>
              <button onClick={()=>setShowCreate(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">x</button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
                <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
                  placeholder="e.g. Chiller Unit 1 — Refrigerant Recharge" className={inp} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
                  rows={3} placeholder="Describe the work required…" className={inp+" resize-none"} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                  <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className={inp}>
                    {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
                  <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} className={inp}>
                    {PRIORITIES.filter(p=>p!=="all").map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Est. Hours</label>
                  <input type="number" min="0.5" step="0.5" value={form.estimated_hours}
                    onChange={e=>setForm({...form,estimated_hours:e.target.value})} className={inp} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={()=>setShowCreate(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50">{saving?"Saving…":"Create Work Order"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
