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

const S = {draft:"bg-slate-100 text-slate-600",sent:"bg-blue-100 text-blue-800",paid:"bg-emerald-100 text-emerald-800",overdue:"bg-red-100 text-red-800",cancelled:"bg-slate-100 text-slate-400"};
const STATUSES = ["draft","sent","paid","overdue","cancelled"];

export default function InvoiceDetailPage() {
  const { id }    = useParams();
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState(null);

  const { data: invoice, isLoading, refetch } = useQuery(
    ["invoice-detail", id],
    () => authFetch(`/api/v1/invoices/${id}`).then(r=>r.json()),
    { enabled: !!id, onSuccess: (d) => { if (!form) setForm(d); } }
  );

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400";

  async function save(e) {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {...form};
      if (payload.amount)     payload.amount     = Number(payload.amount);
      if (payload.tax_amount) payload.tax_amount = Number(payload.tax_amount);
      const r = await authFetch(`/api/v1/invoices/${id}`, {
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
      const today = new Date().toISOString().slice(0,10);
      const body = status === "paid"
        ? { status, paid_date: today }
        : { status };
      const r = await authFetch(`/api/v1/invoices/${id}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(body)
      });
      if (r.ok) refetch();
      else alert("Failed to update status");
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  if (isLoading) return <PageWrapper><LoadingState /></PageWrapper>;
  if (!invoice || invoice.detail) return (
    <PageWrapper>
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">Invoice not found</p>
        <Link href="/commercial/invoices" className="text-blue-600 underline text-sm">Back to Invoices</Link>
      </div>
    </PageWrapper>
  );

  const isOverdue = invoice.status === "overdue";
  const isPaid    = invoice.status === "paid";

  return (
    <PageWrapper>
      <PageHeader
        title={invoice.invoice_number || invoice.title || "Invoice"}
        subtitle={invoice.title || `Amount: EGP ${fmtNum(invoice.amount)}`}
        breadcrumbs={[{label:"Commercial",href:"/commercial"},{label:"Invoices",href:"/commercial/invoices"},{label:invoice.invoice_number||id}]}
        actions={
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button variant="secondary" size="sm" onClick={()=>{setForm({...invoice});setEditing(true)}}>Edit</Button>
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
            This invoice is overdue — due {fmtDate(invoice.due_date)}. Follow up with client immediately.
          </p>
        </div>
      )}

      {!editing && (
        <div className="flex items-center gap-3 mb-5 p-4 bg-white border border-slate-200 rounded-xl">
          <span className="text-xs font-semibold text-slate-500 mr-2">STATUS:</span>
          <span className={"inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold "+(S[invoice.status]||"bg-slate-100 text-slate-600")}>{invoice.status||"—"}</span>
          <div className="flex-1" />
          {!isPaid && (
            <button onClick={()=>updateStatus("paid")} disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              Mark as Paid
            </button>
          )}
          {invoice.status==="draft" && (
            <button onClick={()=>updateStatus("sent")} disabled={saving}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:border-blue-400 hover:text-blue-700 transition-colors">
              Send Invoice
            </button>
          )}
          {invoice.status==="sent" && (
            <button onClick={()=>updateStatus("overdue")} disabled={saving}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:border-red-300 hover:text-red-600 transition-colors">
              Mark Overdue
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <SectionCard title="Invoice Details">
            {editing ? (
              <form onSubmit={save} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
                    <input required value={form?.title||""} onChange={e=>setForm({...form,title:e.target.value})} className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Invoice Number</label>
                    <input value={form?.invoice_number||""} onChange={e=>setForm({...form,invoice_number:e.target.value})} className={inp} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (EGP) *</label>
                    <input required type="number" value={form?.amount||""} onChange={e=>setForm({...form,amount:e.target.value})} className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tax Amount (EGP)</label>
                    <input type="number" value={form?.tax_amount||""} onChange={e=>setForm({...form,tax_amount:e.target.value})} className={inp} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                    <select value={form?.status||"draft"} onChange={e=>setForm({...form,status:e.target.value})} className={inp}>
                      {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Issue Date</label>
                    <input type="date" value={form?.issue_date?.slice(0,10)||""} onChange={e=>setForm({...form,issue_date:e.target.value})} className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date</label>
                    <input type="date" value={form?.due_date?.slice(0,10)||""} onChange={e=>setForm({...form,due_date:e.target.value})} className={inp} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                  <textarea value={form?.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}
                    rows={3} className={inp+" resize-none"} />
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Invoice Number</p>
                    <p className="text-slate-800 font-mono font-bold">{invoice.invoice_number||"—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Title</p>
                    <p className="text-slate-700">{invoice.title||"—"}</p>
                  </div>
                </div>
                {invoice.notes && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-slate-700 text-sm">{invoice.notes}</p>
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Amount">
            <div className="space-y-3">
              <div className="text-center py-3 bg-slate-50 rounded-xl">
                <div className="text-3xl font-black text-slate-800">EGP {fmtNum(invoice.amount)}</div>
                <p className="text-xs text-slate-500 mt-1">Invoice Amount</p>
              </div>
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between text-xs text-slate-500 px-1">
                  <span>Tax</span>
                  <span className="font-semibold text-slate-700">EGP {fmtNum(invoice.tax_amount)}</span>
                </div>
              )}
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between text-sm font-bold border-t border-slate-100 pt-2 px-1">
                  <span>Total</span>
                  <span className="text-slate-800">EGP {fmtNum(invoice.total_amount||(invoice.amount+invoice.tax_amount))}</span>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Timeline">
            <dl className="space-y-3">
              {[
                {label:"Status",    value:<span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold "+(S[invoice.status]||"bg-slate-100 text-slate-600")}>{invoice.status||"—"}</span>},
                {label:"Issue Date",value:fmtDate(invoice.issue_date||invoice.created_at)},
                {label:"Due Date",  value:<span className={isOverdue?"text-red-600 font-semibold":""}>{fmtDate(invoice.due_date)}</span>},
                {label:"Paid Date", value:<span className="text-emerald-600 font-semibold">{fmtDate(invoice.paid_date)}</span>},
                {label:"Created",   value:fmtDate(invoice.created_at)},
              ].map(({label,value})=>(
                <div key={label} className="flex justify-between items-center">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="text-xs">{value}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>

          <Link href="/commercial/invoices" className="block w-full px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-center">
            Back to Invoices
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
