"use client";
// @ts-nocheck
// Triangle Black — Invoice Payment Recording
// Sprint-036: Invoice Payment Workflow
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";
import { toast } from "sonner";

const fmtEGP = (n: any) => `EGP ${Number(n||0).toLocaleString("en",{minimumFractionDigits:2})}`;
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const PAYMENT_METHODS = ["bank_transfer","cash","cheque","credit_card","online","other"];
const STATUS_COLOR: Record<string,string> = {
  draft:"bg-gray-100 text-gray-600", sent:"bg-blue-100 text-blue-800",
  paid:"bg-green-100 text-green-800", overdue:"bg-red-100 text-red-800",
  partially_paid:"bg-yellow-100 text-yellow-800", cancelled:"bg-gray-100 text-gray-500",
};

export default function InvoicePaymentPage() {
  const { id }  = useParams();
  const router  = useRouter();
  const [mounted, setMounted]     = useState(false);
  const [invoice, setInvoice]     = useState<any>(null);
  const [payments, setPayments]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving,  setSaving]      = useState(false);
  const [form, setForm] = useState({
    amount: "", method: "bank_transfer", reference: "", notes: "", payment_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !id) return;
    Promise.all([
      tbFetch(`/api/v1/invoices/${id}`).then(r => r.data ?? r),
      tbFetch(`/api/v1/invoices/${id}/payments`).then(r => r.data ?? r).catch(() => []),
    ]).then(([inv, pmts]: any[]) => {
      setInvoice(inv);
      const plist = Array.isArray(pmts) ? pmts : pmts?.payments || pmts?.results || [];
      setPayments(plist);
    }).catch(() => toast.error("Failed to load invoice"))
      .finally(() => setLoading(false));
  }, [mounted, id]);

  const totalPaid = payments.reduce((s: any, p: any) => s + Number(p.amount || 0), 0);
  const outstanding = Math.max(0, Number(invoice?.total_amount || 0) - totalPaid);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) { toast.error("Enter a valid amount"); return; }
    setSaving(true);
    try {
      const res = await tbFetch(`/api/v1/invoices/${id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const data = await res.json();
      if (data.id || data.payment_id || res.ok) {
        toast.success(`Payment of ${fmtEGP(form.amount)} recorded`);
        setPayments(prev => [...prev, data]);
        setForm(f => ({ ...f, amount: "", reference: "", notes: "" }));
        if (data.invoice) setInvoice(data.invoice);
      } else {
        toast.error(data.detail || "Payment recording failed");
      }
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  };

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  if (!invoice || invoice.detail) return (
    <div className="p-8 text-center text-gray-500">
      <p className="text-2xl mb-2">🧾</p><p>Invoice not found</p>
    </div>
  );

  const pctPaid = invoice.total_amount > 0 ? Math.min(100, (totalPaid / Number(invoice.total_amount)) * 100) : 0;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button onClick={() => router.push(`/commercial/invoices/${id}`)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
          ← Invoice
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--color-text-1)]">Record Payment</h1>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${(STATUS_COLOR as Record<string, any>)[invoice.status] || "bg-gray-100 text-gray-600"}`}>
            {invoice.status}
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-1">
          {invoice.invoice_number} · Due: {fmtDate(invoice.due_date)}
        </p>
      </div>

      {/* Payment Progress */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label:"Invoice Total",  value:fmtEGP(invoice.total_amount), color:"text-[var(--color-text-1)]" },
            { label:"Total Paid",     value:fmtEGP(totalPaid),            color:"text-green-600" },
            { label:"Outstanding",    value:fmtEGP(outstanding),          color:outstanding>0?"text-red-600":"text-green-600" },
          ].map((k: any) => (
            <div key={k.label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">{k.label}</p>
              <p className={`text-lg font-bold mt-1 ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Payment progress</span>
            <span>{Math.round(pctPaid)}% paid</span>
          </div>
          <div className="bg-gray-100 rounded-full h-3">
            <div className={`h-3 rounded-full transition-all ${pctPaid >= 100 ? "bg-green-500" : "bg-blue-500"}`}
              style={{ width: `${pctPaid}%` }} />
          </div>
        </div>
      </div>

      {/* Record Payment Form */}
      {outstanding > 0 && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-[var(--color-text-1)]">Record New Payment</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Amount (EGP) *</label>
              <input type="number" min="0.01" step="0.01" max={outstanding} required
                value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))}
                placeholder={`Max: ${outstanding.toFixed(2)}`}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment Date</label>
              <input type="date" value={form.payment_date}
                onChange={e => setForm(f=>({...f,payment_date:e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
              <select value={form.method} onChange={e => setForm(f=>({...f,method:e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                {PAYMENT_METHODS.map((m: any) => <option key={m} value={m}>{m.replace("_"," ").replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Reference / Cheque No.</label>
              <input value={form.reference} onChange={e => setForm(f=>({...f,reference:e.target.value}))}
                placeholder="TRX-001 or cheque number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <input value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))}
              placeholder="Payment notes..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setForm(f=>({...f,amount:outstanding.toFixed(2)}))}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
              Pay Full Amount
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-500 disabled:opacity-50 transition-colors">
              {saving ? "Recording..." : "✅ Record Payment"}
            </button>
          </div>
        </form>
      )}

      {outstanding <= 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <p className="text-2xl mb-2">✅</p>
          <p className="font-semibold text-green-700">Invoice Fully Paid</p>
          <p className="text-sm text-green-600 mt-1">Total paid: {fmtEGP(totalPaid)}</p>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-[var(--color-text-1)]">Payment History ({payments.length})</h3>
        </div>
        {payments.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">No payments recorded yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                {["Date","Amount","Method","Reference","Notes"].map((h: any) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p: any, i: number) => (
                <tr key={p.id || i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{fmtDate(p.payment_date || p.created_at)}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">{fmtEGP(p.amount)}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{(p.method || "—").replace("_"," ")}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.reference || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 truncate max-w-32">{p.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
