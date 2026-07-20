// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { supplierInvoicesApi } from "../../../../../lib/supplier-invoices-api";
import { purchasingApi } from "../../../../../lib/purchasing-api";

export default function InvoiceMatchingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [matches, setMatches] = useState<Record<string, any[]>>({});
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    supplier_invoice_id: "",
    purchase_order_id: "",
    goods_receipt_id: "",
    match_status: "matched",
    variance_amount: "0",
    variance_reason: "",
    reviewed_by: "manager",
  });

  async function load() {
    setError("");
    try {
      const [invoiceData, poData, grnData] = await Promise.all([
        supplierInvoicesApi.listInvoices(),
        purchasingApi.listPOs(),
        purchasingApi.listGRNs(),
      ]);

      const invoiceItems = Array.isArray(invoiceData?.items) ? invoiceData.items : [];
      setInvoices(invoiceItems);
      setPurchaseOrders(Array.isArray(poData?.items) ? poData.items : []);
      setReceipts(Array.isArray(grnData?.items) ? grnData.items : []);

      const out: Record<string, any[]> = {};
      for (const inv of invoiceItems.slice(0, 20)) {
        try {
          out[inv.id] = await supplierInvoicesApi.listMatches(inv.id);
        } catch {
          out[inv.id] = [];
        }
      }
      setMatches(out);
    } catch (e: any) {
      setError(String(e?.message || e));
      setInvoices([]);
      setPurchaseOrders([]);
      setReceipts([]);
      setMatches({});
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onMatch(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await supplierInvoicesApi.matchInvoice(form.supplier_invoice_id, {
        purchase_order_id: form.purchase_order_id || null,
        goods_receipt_id: form.goods_receipt_id || null,
        match_status: form.match_status,
        variance_amount: Number(form.variance_amount || 0),
        variance_reason: form.variance_reason || null,
        reviewed_by: form.reviewed_by || null,
      });

      setForm({
        supplier_invoice_id: "",
        purchase_order_id: "",
        goods_receipt_id: "",
        match_status: "matched",
        variance_amount: "0",
        variance_reason: "",
        reviewed_by: "manager",
      });

      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb/>
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Supply Chain Center
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Invoice Matching
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Match supplier invoices to purchase orders and goods receipts, and record variances for review.
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Invoice Match Review</h2>

          <div className="mt-5 space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-slate-950">
                      {invoice.invoice_number || "Untitled Invoice"}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Supplier: {invoice.supplier_id || "—"}
                    </div>
                  </div>

                  <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    {invoice.status || "draft"}
                  </span>
                </div>

                <div className="mt-4 text-sm text-slate-700">
                  Linked PO: {invoice.linked_purchase_order_id || "—"} • Total: {invoice.total_amount ?? 0}
                </div>

                <div className="mt-4 space-y-3">
                  {(matches[invoice.id] || []).map((match) => (
                    <div
                      key={match.id}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                    >
                      <div className="text-sm font-medium text-slate-900">
                        Match Status: {match.match_status}
                      </div>
                      <div className="mt-2 text-sm text-slate-700">
                        PO: {match.purchase_order_id || "—"} • GRN: {match.goods_receipt_id || "—"}
                      </div>
                      <div className="mt-1 text-sm text-slate-700">
                        Variance: {match.variance_amount ?? 0}
                      </div>
                      <div className="mt-1 text-sm leading-6 text-slate-600">
                        {match.variance_reason || "No variance reason."}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Create Match</h2>

          <form onSubmit={onMatch} className="mt-5 space-y-4">
            <select
              value={form.supplier_invoice_id}
              onChange={(e) => setForm({ ...form, supplier_invoice_id: e.target.value })}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            >
              <option value="">Select supplier invoice</option>
              {invoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number || invoice.id}
                </option>
              ))}
            </select>

            <select
              value={form.purchase_order_id}
              onChange={(e) => setForm({ ...form, purchase_order_id: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            >
              <option value="">Select purchase order</option>
              {purchaseOrders.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.po_number || po.id}
                </option>
              ))}
            </select>

            <select
              value={form.goods_receipt_id}
              onChange={(e) => setForm({ ...form, goods_receipt_id: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            >
              <option value="">Select goods receipt</option>
              {receipts.map((grn) => (
                <option key={grn.id} value={grn.id}>
                  {grn.grn_number || grn.id}
                </option>
              ))}
            </select>

            <select
              value={form.match_status}
              onChange={(e) => setForm({ ...form, match_status: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            >
              <option value="matched">Matched</option>
              <option value="variance">Variance</option>
              <option value="rejected">Rejected</option>
            </select>

            <input
              value={form.variance_amount}
              onChange={(e) => setForm({ ...form, variance_amount: e.target.value })}
              placeholder="Variance amount"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />

            <textarea
              value={form.variance_reason}
              onChange={(e) => setForm({ ...form, variance_reason: e.target.value })}
              placeholder="Variance reason"
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />

            <input
              value={form.reviewed_by}
              onChange={(e) => setForm({ ...form, reviewed_by: e.target.value })}
              placeholder="Reviewed by"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white"
            >
              Save Invoice Match
            </button>
          </form>
        </section>
      </section>
    </div>
  );
}
