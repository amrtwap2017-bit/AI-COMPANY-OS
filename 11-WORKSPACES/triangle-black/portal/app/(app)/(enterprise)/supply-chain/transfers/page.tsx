"use client";

import { useState, useEffect } from "react";
import { PageHeader, SectionCard, EmptyState, LoadingState, AlertBanner } from "@/components/ui";
import { fmtCurrency } from "@/lib/design-tokens";
import { ArrowRightLeft, Plus, X, Package, Warehouse, CheckCircle2 } from "lucide-react";
import {
  fetchTransfers, createTransfer,
  fetchWarehouses, fetchInventoryItems,
  type TransferListItem, type TransferCreate,
} from "@/lib/transfers-api";

function TransferRow({ t }: { t: TransferListItem }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4">
        <p className="font-medium text-slate-900">{t.item_name}</p>
        <p className="text-xs text-slate-500 mt-0.5">{t.transfer_id.slice(0, 8)}...</p>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2 text-slate-700">
          <span className="text-sm">{t.from_warehouse}</span>
          <ArrowRightLeft className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
          <span className="text-sm">{t.to_warehouse}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-right font-mono text-slate-900">{t.qty.toLocaleString()}</td>
      <td className="py-3 px-4 text-right text-slate-700">{fmtCurrency(t.total_cost)}</td>
      <td className="py-3 px-4 text-slate-500 text-sm">{t.reason ?? "-"}</td>
      <td className="py-3 px-4 text-right text-xs text-slate-400">{t.created_at.slice(0, 16).replace("T", " ")}</td>
      <td className="py-3 px-4 text-center">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3 w-3" /> Done
        </span>
      </td>
    </tr>
  );
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<TransferListItem[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<TransferCreate>({
    item_id: "", from_warehouse_id: "", to_warehouse_id: "",
    qty: 1, unit_cost: 0, reason: "", notes: "",
  });

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [t, w, i] = await Promise.all([fetchTransfers(), fetchWarehouses(), fetchInventoryItems()]);
      setTransfers(t);
      setWarehouses(Array.isArray(w) ? w : []);
      setItems(Array.isArray(i) ? i : []);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.from_warehouse_id === form.to_warehouse_id) {
      setError("Source and destination warehouses must be different");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const result = await createTransfer(form);
      setSuccess("Transfer " + result.out_movement.movement_number + " completed successfully");
      setShowForm(false);
      setForm({ item_id: "", from_warehouse_id: "", to_warehouse_id: "", qty: 1, unit_cost: 0, reason: "", notes: "" });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? "Transfer failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState message="Loading transfers..." />;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Warehouse Transfers"
        subtitle="Move inventory between warehouses"
        actions={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "New Transfer"}
          </button>
        }
      />

      {error && <AlertBanner type="error" title={error} onClose={() => setError(null)} />}
      {success && <AlertBanner type="success" title={success} onClose={() => setSuccess(null)} />}

      {showForm && (
        <SectionCard title="Create Transfer" subtitle="Move stock between warehouses">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Item *</label>
              <select
                required
                value={form.item_id}
                onChange={e => setForm(f => ({ ...f, item_id: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select item...</option>
                {items.map((i: any) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">From Warehouse *</label>
              <select
                required
                value={form.from_warehouse_id}
                onChange={e => setForm(f => ({ ...f, from_warehouse_id: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select source...</option>
                {warehouses.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">To Warehouse *</label>
              <select
                required
                value={form.to_warehouse_id}
                onChange={e => setForm(f => ({ ...f, to_warehouse_id: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select destination...</option>
                {warehouses.filter((w: any) => w.id !== form.from_warehouse_id).map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Quantity *</label>
              <input
                type="number" required min="0.001" step="0.001"
                value={form.qty}
                onChange={e => setForm(f => ({ ...f, qty: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Unit Cost (override)</label>
              <input
                type="number" min="0" step="0.01"
                value={form.unit_cost ?? ""}
                onChange={e => setForm(f => ({ ...f, unit_cost: Number(e.target.value) }))}
                placeholder="Leave 0 to use avg cost"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Reason</label>
              <input
                type="text"
                value={form.reason ?? ""}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="Rebalancing, emergency, etc."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <ArrowRightLeft className="h-4 w-4" />
                {submitting ? "Processing..." : "Execute Transfer"}
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      <SectionCard
        title="Transfer History"
        subtitle={transfers.length + " transfers"}
      >
        {transfers.length === 0 ? (
          <EmptyState
            title="No transfers yet"
            description="Create your first warehouse transfer using the button above."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Item</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Route</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Qty</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Value</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Reason</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transfers.map(t => <TransferRow key={t.transfer_id} t={t} />)}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
