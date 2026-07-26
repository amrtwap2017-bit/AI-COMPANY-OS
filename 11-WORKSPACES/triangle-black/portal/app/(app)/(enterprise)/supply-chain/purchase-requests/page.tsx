// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState, Modal } from "@/components/ui";
import { Button } from "@/components/ui/Button";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return String(d).slice(0,10); } };
const fmtNum  = (n) => { try { return Number(n||0).toLocaleString(); } catch { return "0"; } };

const P = {critical:"bg-red-100 text-red-800 border-red-200",high:"bg-orange-100 text-orange-800 border-orange-200",medium:"bg-amber-100 text-amber-800 border-amber-200",low:"bg-slate-100 text-slate-600 border-slate-200"};
const S = {draft:"bg-slate-100 text-slate-600",submitted:"bg-blue-100 text-blue-800",approved:"bg-emerald-100 text-emerald-800",rejected:"bg-red-100 text-red-700",ordered:"bg-indigo-100 text-indigo-800",completed:"bg-emerald-100 text-emerald-800"};

const STATUSES   = ["all","draft","submitted","approved","rejected","ordered","completed"];
const PRIORITIES = ["all","critical","high","medium","low"];

export default function PurchaseRequestsPage() {
  const [sf, setSf] = useState("all");
  const [pf, setPf] = useState("all");
  const [q,  setQ]  = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title:"", description:"", category:"",
    priority:"medium", estimated_cost:"",
    hotel_id:"tb-default-hotel-000000000001"
  });

  const { data: raw = [], isLoading, refetch } = useQuery(
    ["purchase-requests-page"],
    () => authFetch("/api/v1/purchase-requests/?limit=200").then(r => r.json()),
    { refetchInterval: 120000 }
  );

  const prs = toArr(raw);
  const filtered = prs.filter(p => {
    if (sf !== "all" && p.status   !== sf) return false;
    if (pf !== "all" && p.priority !== pf) return false;
    if (q && !p.title?.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const total    = prs.length;
  const pending  = prs.filter(p => ["draft","submitted"].includes(p.status)).length;
  const approved = prs.filter(p => p.status === "approved").length;
  const rejected = prs.filter(p => p.status === "rejected").length;

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400";

  async function save(e) {
    e.preventDefault(); setSaving(true);
    try {
      const r = await authFetch("/api/v1/purchase-requests/", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({...form, estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : undefined})
      });
      if (r.ok) {
        setShowCreate(false);
        setForm({title:"",description:"",category:"",priority:"medium",estimated_cost:"",hotel_id:"tb-default-hotel-000000000001"});
        refetch();
      } else {
        const err = await r.json().catch(()=>({}));
        alert(err?.detail || "Failed to create purchase request");
      }
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Purchase Requests"
        subtitle={`${total} total · ${pending} pending approval · ${approved} approved`}
        breadcrumbs={[{label:"Supply Chain",href:"/supply-chain"},{label:"Purchase Requests"}]}
        actions={<Button variant="primary" size="sm" onClick={()=>setShowCreate(true)}>＋ New Request</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Total",    value:total,    color:"text-slate-800"},
          {label:"Pending",  value:pending,  color:"text-amber-700"},
          {label:"Approved", value:approved, color:"text-emerald-700"},
          {label:"Rejected", value:rejected, color:"text-red-700"},
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading ? "…" : k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <SectionCard title={`Purchase Requests (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search requests…" value={q}
            onChange={e => setQ(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:border-blue-400" />
          <select value={sf} onChange={e => setSf(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {STATUSES.map(s=><option key={s} value={s}>{s==="all"?"All Status":s}</option>)}
          </select>
          <select value={pf} onChange={e => setPf(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {PRIORITIES.map(p=><option key={p} value={p}>{p==="all"?"All Priority":p}</option>)}
          </select>
          {(sf!=="all"||pf!=="all"||q) && (
            <button onClick={()=>{setSf("all");setPf("all");setQ("");}}
              className="text-xs text-slate-400 hover:text-red-500 underline">Clear</button>
          )}
        </div>

        {isLoading ? <LoadingState /> : filtered.length===0 ? (
          <EmptyState title="No purchase requests" subtitle="Create a new request to get started"
            action={<Button variant="primary" size="sm" onClick={()=>setShowCreate(true)}>New Request</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Request Title","Category","Est. Cost","Priority","Status","Date"].map(h=>(
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-800">{p.title}</p>
                      <p className="text-xs text-slate-400">{p.description?.slice(0,60)||""}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">{p.category||"—"}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-sm font-medium text-slate-700">{p.estimated_cost ? `EGP ${fmtNum(p.estimated_cost)}` : "—"}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border " + (P[p.priority]||P.low)}>{p.priority||"—"}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold " + (S[p.status]||"bg-slate-100 text-slate-600")}>{p.status||"—"}</span>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-400">{fmtDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <Modal open={showCreate} onClose={()=>setShowCreate(false)} title="New Purchase Request" size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={()=>setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={saving} onClick={save}>Submit Request</Button>
          </div>
        }>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
            <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
              placeholder="e.g. HVAC Spare Parts — R410A Refrigerant x10kg" className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
              rows={3} placeholder="What is needed, why, specifications, urgency…"
              className={inp + " resize-none"} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
              <input value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                placeholder="HVAC / Electrical…" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
              <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} className={inp}>
                {PRIORITIES.filter(p=>p!=="all").map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Est. Cost (EGP)</label>
              <input type="number" value={form.estimated_cost} onChange={e=>setForm({...form,estimated_cost:e.target.value})}
                placeholder="5000" className={inp} />
            </div>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
