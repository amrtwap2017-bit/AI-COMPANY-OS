"use client";
// @ts-nocheck
// Triangle Black — Goods Receipt Note (GRN) Create
// Sprint-040: GRN Create Form

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";
import { toast } from "sonner";

const CONDITION = ["good","damaged","partial","rejected"];

export default function GoodsReceiptNewPage() {
  const router = useRouter();
  const [mounted, setMounted]   = useState(false);
  const [pos, setPos]           = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [lines, setLines]       = useState([{ description:"", qty_received:1, qty_accepted:1, condition:"good", notes:"" }]);
  const [form, setForm] = useState({
    po_id:           "",
    received_date:   new Date().toISOString().split("T")[0],
    received_by:     "",
    delivery_note:   "",
    overall_condition: "good",
    notes:           "",
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    tbFetch("/api/v1/purchase-orders/?limit=100&status=approved")
      .then(r => r.json())
      .then(d => {
        const items = Array.isArray(d) ? d : d?.results || d?.items || [];
        setPos(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mounted]);

  useEffect(() => {
    if (!form.po_id) { setSelectedPO(null); return; }
    const po = pos.find(p => p.id === form.po_id);
    setSelectedPO(po || null);
    if (po?.lines?.length > 0) {
      setLines(po.lines.map((l: any) => ({
        description:  l.description || l.item_name || "",
        qty_received: l.qty || l.quantity || 1,
        qty_accepted: l.qty || l.quantity || 1,
        condition:    "good",
        notes:        "",
      })));
    }
  }, [form.po_id, pos]);

  const addLine = () => setLines(l => [...l, { description:"", qty_received:1, qty_accepted:1, condition:"good", notes:"" }]);
  const removeLine = (i: number) => setLines(l => l.filter((_,idx) => idx !== i));
  const updateLine = (i: number, key: string, val: any) =>
    setLines(l => l.map((ln,idx) => idx === i ? {...ln, [key]: val} : ln));

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.po_id) { toast.error("Please select a Purchase Order"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        items: lines.filter(l => l.description),
        lines: lines.filter(l => l.description),
      };
      const res = await tbFetch("/api/v1/goods-receipts/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.id || data.grn_number) {
        toast.success(`GRN ${data.grn_number || "created"} successfully`);
        router.push(`/supply-chain/goods-receipts/${data.id || ""}`);
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
        <button onClick={() => router.push("/supply-chain/goods-receipts")}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
          ← Goods Receipts
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-text-1)]">New Goods Receipt Note</h1>
        <p className="text-gray-500 text-sm mt-1">Record received goods against a Purchase Order</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PO Selection */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-[var(--color-text-1)]">Receipt Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Purchase Order *</label>
              <select value={form.po_id} onChange={e => setForm(f=>({...f,po_id:e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" required>
                <option value="">Select PO...</option>
                {pos.map(po => (
                  <option key={po.id} value={po.id}>
                    {po.po_number || po.id.slice(0,8)} — {po.status}
                    {po.total_amount ? ` (EGP ${Number(po.total_amount).toLocaleString()})` : ""}
                  </option>
                ))}
              </select>
              {pos.length === 0 && <p className="text-xs text-gray-400 mt-1">No approved POs found</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Received Date</label>
              <input type="date" value={form.received_date}
                onChange={e => setForm(f=>({...f,received_date:e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Received By</label>
              <input value={form.received_by} onChange={e => setForm(f=>({...f,received_by:e.target.value}))}
                placeholder="Name of receiving staff"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Delivery Note Number</label>
              <input value={form.delivery_note} onChange={e => setForm(f=>({...f,delivery_note:e.target.value}))}
                placeholder="DN-001"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Overall Condition</label>
              <select value={form.overall_condition}
                onChange={e => setForm(f=>({...f,overall_condition:e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                {CONDITION.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {selectedPO && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm">
              <p className="text-blue-700 font-medium">PO: {selectedPO.po_number}</p>
              <p className="text-blue-600 text-xs mt-1">
                Supplier: {selectedPO.vendor_id || "—"} ·
                Total: EGP {Number(selectedPO.total_amount||0).toLocaleString()} ·
                Payment: {selectedPO.payment_terms || "—"}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))}
              rows={2} placeholder="General receipt notes..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--color-text-1)]">Received Items</h2>
            <button type="button" onClick={addLine}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ Add Item</button>
          </div>
          <div className="space-y-3">
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-xl">
                <div className="col-span-4">
                  {i === 0 && <label className="block text-xs text-gray-500 mb-1">Description</label>}
                  <input value={line.description} onChange={e => updateLine(i,"description",e.target.value)}
                    placeholder="Item description..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs text-gray-500 mb-1">Qty Received</label>}
                  <input type="number" min="0" step="0.01" value={line.qty_received}
                    onChange={e => updateLine(i,"qty_received",e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs text-gray-500 mb-1">Qty Accepted</label>}
                  <input type="number" min="0" step="0.01" value={line.qty_accepted}
                    onChange={e => updateLine(i,"qty_accepted",e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs text-gray-500 mb-1">Condition</label>}
                  <select value={line.condition} onChange={e => updateLine(i,"condition",e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900">
                    {CONDITION.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-1">
                  {i === 0 && <div className="h-5" />}
                  <button type="button" onClick={() => removeLine(i)} disabled={lines.length === 1}
                    className="w-full py-2 text-gray-400 hover:text-red-500 text-lg">×</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="flex-1 py-3 bg-[var(--color-bg)] text-white rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
            {saving ? "Creating GRN..." : "✅ Create Goods Receipt Note"}
          </button>
          <button type="button" onClick={() => router.push("/supply-chain/goods-receipts")}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
