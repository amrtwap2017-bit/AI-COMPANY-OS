"use client";
// @ts-nocheck
// Triangle Black — Create Purchase Order
// Sprint-035: PO Create Form
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";
import { toast } from "sonner";

const PAYMENT_TERMS = ["net_15","net_30","net_45","net_60","net_90","cash","advance"];
const PO_STATUS = ["draft","pending","approved","sent","partial","completed","cancelled"];

export default function PurchaseOrderNewPage() {
  const router = useRouter();
  const [mounted, setMounted]     = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving,  setSaving]      = useState(false);
  const [lines, setLines]         = useState([{ description:"", qty:1, unit_price:0, unit:"pcs" }]);
  const [form, setForm] = useState({
    vendor_id:      "",
    status:         "draft",
    payment_terms:  "net_30",
    expected_date:  "",
    delivery_notes: "",
    vat_pct:        14,
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    tbFetch("/api/v1/suppliers/?limit=100")
      .then(r => r.data ?? r)
      .then((d: any) => {
        const items = Array.isArray(d) ? d : d?.results || d?.items || [];
        setSuppliers(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mounted]);

  const addLine = () => setLines(l => [...l, { description:"", qty:1, unit_price:0, unit:"pcs" }]);
  const removeLine = (i: number) => setLines(l => l.filter((_: any, idx: any) => idx !== i));
  const updateLine = (i: number, key: string, val: any) =>
    setLines(l => l.map((ln: any, idx: any) => idx === i ? {...ln, [key]: val} : ln));

  const subtotal  = lines.reduce((s: any, l: any) => s + (Number(l.qty)||0) * (Number(l.unit_price)||0), 0);
  const vat       = subtotal * (Number(form.vat_pct)||0) / 100;
  const total     = subtotal + vat;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.vendor_id) { toast.error("Please select a supplier"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        lines: lines.filter((l: any) => l.description),
        subtotal: subtotal.toFixed(2),
        vat_amount: vat.toFixed(2),
        total_amount: total.toFixed(2),
      };
      const res = await tbFetch("/api/v1/purchase-orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.id || data.po_number) {
        toast.success(`PO ${data.po_number || data.id?.slice(0,8)} created`);
        router.push(`/supply-chain/purchase-orders/${data.id}`);
      } else {
        toast.error(data.detail?.[0]?.msg || data.detail || "Creation failed");
      }
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  };

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <button onClick={() => router.push("/supply-chain/purchase-orders")}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
          ← Purchase Orders
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-text-1)]">New Purchase Order</h1>
        <p className="text-gray-500 text-sm mt-1">Create a new PO for a supplier</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier + Status */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-[var(--color-text-1)]">Order Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Supplier *</label>
              <select value={form.vendor_id} onChange={(e: any) => setForm(f=>({...f,vendor_id:e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" required>
                <option value="">Select supplier...</option>
                {suppliers.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.company_name} — {s.supplier_code || s.category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e: any) => setForm(f=>({...f,status:e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                {PO_STATUS.map((s: any) => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment Terms</label>
              <select value={form.payment_terms} onChange={(e: any) => setForm(f=>({...f,payment_terms:e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                {PAYMENT_TERMS.map((t: any) => <option key={t} value={t}>{t.replace("_"," ").replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Expected Delivery</label>
              <input type="date" value={form.expected_date} onChange={(e: any) => setForm(f=>({...f,expected_date:e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Delivery Notes</label>
            <textarea value={form.delivery_notes} onChange={(e: any) => setForm(f=>({...f,delivery_notes:e.target.value}))}
              rows={2} placeholder="Special delivery instructions..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--color-text-1)]">Line Items</h2>
            <button type="button" onClick={addLine}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ Add Line</button>
          </div>
          <div className="space-y-3">
            {lines.map((line: any, i: any) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  {i === 0 && <label className="block text-xs text-gray-500 mb-1">Description</label>}
                  <input value={line.description} onChange={(e: any) => updateLine(i,"description",e.target.value)}
                    placeholder="Item description..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs text-gray-500 mb-1">Unit</label>}
                  <input value={line.unit} onChange={(e: any) => updateLine(i,"unit",e.target.value)}
                    placeholder="pcs"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs text-gray-500 mb-1">Qty</label>}
                  <input type="number" min="0" step="0.01" value={line.qty} onChange={(e: any) => updateLine(i,"qty",e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs text-gray-500 mb-1">Unit Price (EGP)</label>}
                  <input type="number" min="0" step="0.01" value={line.unit_price} onChange={(e: any) => updateLine(i,"unit_price",e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div className="col-span-1 flex justify-end">
                  {i === 0 && <div className="h-5" />}
                  <button type="button" onClick={() => removeLine(i)}
                    className="py-2 text-gray-400 hover:text-red-500 text-lg" disabled={lines.length === 1}>×</button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">EGP {subtotal.toLocaleString("en", {minimumFractionDigits:2})}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">VAT</span>
                <input type="number" min="0" max="100" value={form.vat_pct}
                  onChange={(e: any) => setForm(f=>({...f,vat_pct:Number(e.target.value)}))}
                  className="w-14 border border-gray-300 rounded px-2 py-0.5 text-xs text-center" />
                <span className="text-gray-400 text-xs">%</span>
              </div>
              <span>EGP {vat.toLocaleString("en", {minimumFractionDigits:2})}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
              <span>Total</span>
              <span className="text-[var(--color-text-1)]">EGP {total.toLocaleString("en", {minimumFractionDigits:2})}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="flex-1 py-3 bg-[var(--color-bg)] text-white rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
            {saving ? "Creating..." : "Create Purchase Order"}
          </button>
          <button type="button" onClick={() => router.push("/supply-chain/purchase-orders")}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
