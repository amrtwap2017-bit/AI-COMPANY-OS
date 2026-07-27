"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { useRole } from "@/lib/hooks/useCurrentUser";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtNum  = (n) => { try { return Number(n||0).toLocaleString(); } catch { return "0"; } };

const S = {draft:"bg-slate-100 text-secondary",sent:"bg-blue-100 text-blue-800",paid:"bg-emerald-100 text-emerald-800",overdue:"bg-red-100 text-red-800",cancelled:"bg-slate-100 text-tertiary"};
const STATUSES = ["all","draft","sent","paid","overdue","cancelled"];

export default function InvoicesPage() {
  const { canCreate, isAdmin } = useRole();
  const [q,  setQ]  = useState("");
  const [sf, setSf] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [form, setForm] = useState({
    title:"", invoice_number:"", amount:"", tax_amount:"",
    status:"draft", issue_date:"", due_date:"", notes:"",
    hotel_id:"tb-default-hotel-000000000001"
  });

  const { data: raw=[], isLoading, refetch } = useQuery(
    ["invoices-list"],
    () => authFetch("/api/v1/invoices/?limit=200").then(r=>r.json()),
    { refetchInterval: 120000 }
  );

  const invs = toArr(raw);
  const filtered = invs.filter(i => {
    if (sf!=="all" && i.status!==sf) return false;
    if (q && !(i.invoice_number?.toLowerCase().includes(q.toLowerCase()) || i.title?.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const total      = invs.length;
  const paid       = invs.filter(i=>i.status==="paid").length;
  const sent       = invs.filter(i=>i.status==="sent").length;
  const overdue    = invs.filter(i=>i.status==="overdue").length;
  const totalVal   = invs.reduce((s,i)=>s+(i.amount||0),0);
  const paidVal    = invs.filter(i=>i.status==="paid").reduce((s,i)=>s+(i.amount||0),0);
  const collRate   = totalVal>0 ? Math.round((paidVal/totalVal)*100) : 0;

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400";

  async function save(e) {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {...form};
      if (payload.amount)     payload.amount     = Number(payload.amount);
      if (payload.tax_amount) payload.tax_amount = Number(payload.tax_amount);
      else delete payload.tax_amount;
      if (!payload.issue_date) delete payload.issue_date;
      if (!payload.due_date)   delete payload.due_date;
      if (!payload.notes)      delete payload.notes;
      const r = await authFetch("/api/v1/invoices/", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      });
      if (r.ok) {
        setShowCreate(false);
        setForm({title:"",invoice_number:"",amount:"",tax_amount:"",status:"draft",issue_date:"",due_date:"",notes:"",hotel_id:"tb-default-hotel-000000000001"});
        refetch();
      } else {
        const err = await r.json().catch(()=>({}));
        alert(err?.detail || "Failed to create invoice");
      }
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Invoices"
        subtitle={`${total} invoices · EGP ${fmtNum(totalVal)} total · ${collRate}% collected`}
        breadcrumbs={[{label:"Commercial",href:"/commercial"},{label:"Invoices"}]}
        actions={canCreate ? <Button variant="primary" size="sm" onClick={()=>setShowCreate(true)}>+ New Invoice</Button> : undefined}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Total",        value:total,   color:"text-slate-800"},
          {label:"Paid",         value:paid,    color:"text-emerald-700"},
          {label:"Sent/Pending", value:sent,    color:"text-blue-700"},
          {label:"Overdue",      value:overdue, color:overdue>0?"text-red-700":"text-secondary"},
        ].map(k=>(
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading?"…":k.value}</div>
            <div className="text-xs text-secondary mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {!isLoading && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <div className="text-xs font-semibold text-emerald-700 mb-1">Revenue Collected</div>
            <div className="text-xl font-bold text-emerald-800">EGP {fmtNum(paidVal)}</div>
            <div className="text-xs text-emerald-600 mt-0.5">{collRate}% collection rate</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <div className="text-xs font-semibold text-blue-700 mb-1">Total Invoiced</div>
            <div className="text-xl font-bold text-blue-800">EGP {fmtNum(totalVal)}</div>
            <div className="text-xs text-blue-600 mt-0.5">{total} invoices</div>
          </div>
        </div>
      )}

      <SectionCard title={`Invoices (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search invoice number or title…" value={q}
            onChange={e=>setQ(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:border-blue-400" />
          <select value={sf} onChange={e=>setSf(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {STATUSES.map(s=><option key={s} value={s}>{s==="all"?"All Status":s}</option>)}
          </select>
          {(sf!=="all"||q)&&<button onClick={()=>{setSf("all");setQ("");}} className="text-xs text-tertiary hover:text-red-500 underline">Clear</button>}
        </div>
        {isLoading?<LoadingState/>:filtered.length===0?<EmptyState title="No invoices found"
          action={<Button variant="primary" size="sm" onClick={()=>setShowCreate(true)}>Create Invoice</Button>}
        />:(
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                {["Invoice #","Title","Amount","Status","Issue Date","Due Date","Paid"].map(h=>(
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(i=>(
                  <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3"><Link href={`/commercial/invoices/${i.id}`}><span className="font-mono text-xs font-semibold text-blue-700 hover:underline">{i.invoice_number||"—"}</span></Link></td>
                    <td className="py-3 px-3"><p className="font-medium text-slate-800 truncate max-w-[180px]">{i.title||"—"}</p></td>
                    <td className="py-3 px-3"><span className="font-semibold text-slate-800">EGP {fmtNum(i.amount)}</span></td>
                    <td className="py-3 px-3"><span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold "+(S[i.status]||"bg-slate-100 text-secondary")}>{i.status||"—"}</span></td>
                    <td className="py-3 px-3 text-xs text-tertiary">{fmtDate(i.issue_date||i.created_at)}</td>
                    <td className={`py-3 px-3 text-xs font-medium ${i.status==="overdue"?"text-red-600":"text-tertiary"}`}>{fmtDate(i.due_date)}</td>
                    <td className="py-3 px-3 text-xs text-emerald-600">{i.paid_date?fmtDate(i.paid_date):<span className="text-tertiary">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {showCreate&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <h2 className="font-bold text-slate-900">New Invoice</h2>
              <button onClick={()=>setShowCreate(false)} className="text-tertiary hover:text-secondary text-xl font-bold leading-none">x</button>
            </div>
            <form onSubmit={save} className="tb-page">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Title *</label>
                  <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
                    placeholder="e.g. HVAC Maintenance Q3" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Invoice Number</label>
                  <input value={form.invoice_number} onChange={e=>setForm({...form,invoice_number:e.target.value})}
                    placeholder="INV-2026-0001" className={inp} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Amount (EGP) *</label>
                  <input required type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}
                    placeholder="50000" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Tax Amount (EGP)</label>
                  <input type="number" value={form.tax_amount} onChange={e=>setForm({...form,tax_amount:e.target.value})}
                    placeholder="7500" className={inp} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Status</label>
                  <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className={inp}>
                    {STATUSES.filter(s=>s!=="all").map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Issue Date</label>
                  <input type="date" value={form.issue_date} onChange={e=>setForm({...form,issue_date:e.target.value})} className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Due Date</label>
                  <input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})} className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">Notes</label>
                <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}
                  rows={2} placeholder="Payment terms, reference numbers…" className={inp+" resize-none"} />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={()=>setShowCreate(false)} className="px-4 py-2 text-sm text-secondary border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50">{saving?"Saving…":"Create Invoice"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
