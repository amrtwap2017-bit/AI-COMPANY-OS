// @ts-nocheck

"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { sourcingApi } from "../../../../../../lib/sourcing-api";
import { suppliersApi } from "../../../../../../lib/suppliers-api";

export default function RFQDetailPage() {
  const params = useParams();
  const id = String(params.id || "");

  const [rfq, setRfq] = useState<any>(null);
  const [lines, setLines] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [invited, setInvited] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [error, setError] = useState("");

  const [inviteSupplierId, setInviteSupplierId] = useState("");
  const [quoteForm, setQuoteForm] = useState({
    supplier_id: "",
    quotation_number: "",
    total_amount: "0",
    currency: "EGP",
    validity_date: "",
    lead_time_days: "",
    unit_price: "0",
    quantity: "1",
    tax_amount: "0",
    total_line_amount: "0",
    brand: "",
    notes: "",
  });
  const [comparisonForm, setComparisonForm] = useState({
    selected_supplier_id: "",
    decision_reason: "",
    approved_by: "",
  });
  const [negotiationForm, setNegotiationForm] = useState({
    supplier_id: "",
    negotiation_round: "1",
    summary: "",
    price_change: "",
    lead_time_change: "",
    notes: "",
  });

  async function load() {
    setError("");
    try {
      const [
        rfqData,
        lineData,
        supplierData,
        invitedData,
        quoteData,
        comparisonData,
        negotiationData,
      ] = await Promise.all([
        sourcingApi.getRfq(id),
        sourcingApi.getRfqLines(id),
        suppliersApi.list(),
        sourcingApi.getInvitedSuppliers(id),
        sourcingApi.listQuotations(id),
        sourcingApi.getComparison(id),
        sourcingApi.listNegotiations(id),
      ]);

      setRfq(rfqData);
      setLines(Array.isArray(lineData) ? lineData : []);
      setSuppliers(Array.isArray(supplierData?.items) ? supplierData.items : []);
      setInvited(Array.isArray(invitedData) ? invitedData : []);
      setQuotes(Array.isArray(quoteData) ? quoteData : []);
      setComparison(comparisonData || null);
      setNegotiations(Array.isArray(negotiationData) ? negotiationData : []);
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      if (!active) return;
      await load();
    })();
    return () => {
      active = false;
    };
  }, [id]);

  async function onInvite(e: any) {
    e.preventDefault();
    try {
      await sourcingApi.inviteSupplier(id, inviteSupplierId);
      setInviteSupplierId("");
      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  async function onCreateQuote(e: any) {
    e.preventDefault();
    try {
      const firstLine = lines[0];
      await sourcingApi.createQuotation(id, {
        supplier_id: quoteForm.supplier_id,
        quotation_number: quoteForm.quotation_number,
        total_amount: Number(quoteForm.total_amount || 0),
        currency: quoteForm.currency,
        validity_date: quoteForm.validity_date || null,
        lead_time_days: quoteForm.lead_time_days ? Number(quoteForm.lead_time_days) : null,
        notes: quoteForm.notes || null,
        lines: firstLine ? [{
          rfq_line_id: firstLine.id,
          unit_price: Number(quoteForm.unit_price || 0),
          quantity: Number(quoteForm.quantity || 1),
          tax_amount: Number(quoteForm.tax_amount || 0),
          total_amount: Number(quoteForm.total_line_amount || 0),
          brand: quoteForm.brand || null,
          notes: quoteForm.notes || null,
        }] : [],
      });

      setQuoteForm({
        supplier_id: "",
        quotation_number: "",
        total_amount: "0",
        currency: "EGP",
        validity_date: "",
        lead_time_days: "",
        unit_price: "0",
        quantity: "1",
        tax_amount: "0",
        total_line_amount: "0",
        brand: "",
        notes: "",
      });

      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  async function onSaveComparison(e: any) {
    e.preventDefault();
    try {
      await sourcingApi.saveComparison(id, {
        selected_supplier_id: comparisonForm.selected_supplier_id || null,
        decision_reason: comparisonForm.decision_reason || null,
        approved_by: comparisonForm.approved_by || null,
      });
      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  async function onAddNegotiation(e: any) {
    e.preventDefault();
    try {
      await sourcingApi.addNegotiation(id, {
        supplier_id: negotiationForm.supplier_id || null,
        negotiation_round: Number(negotiationForm.negotiation_round || 1),
        summary: negotiationForm.summary,
        price_change: negotiationForm.price_change ? Number(negotiationForm.price_change) : null,
        lead_time_change: negotiationForm.lead_time_change ? Number(negotiationForm.lead_time_change) : null,
        notes: negotiationForm.notes || null,
      });

      setNegotiationForm({
        supplier_id: "",
        negotiation_round: "1",
        summary: "",
        price_change: "",
        lead_time_change: "",
        notes: "",
      });

      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  if (!rfq) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 text-sm text-slate-600 shadow-sm">
        Loading RFQ...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb/>
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Supply Chain Center
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          {rfq.title}
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          RFQ sourcing workspace for invited suppliers, quotations, comparison, and negotiation history.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">{rfq.rfq_number}</span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">{rfq.status}</span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">{rfq.category || "uncategorized"}</span>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">RFQ Lines</h2>
          <div className="mt-5 space-y-3">
            {lines.map((line) => (
              <div key={line.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">{line.item_name}</div>
                <div className="mt-2 text-sm text-slate-600">
                  Qty: {line.quantity} • Unit: {line.unit || "—"}
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-700">{line.specification || "No specification."}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Invite Supplier</h2>
          <form onSubmit={onInvite} className="mt-5 space-y-4">
            <select
              value={inviteSupplierId}
              onChange={(e) => setInviteSupplierId(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            >
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.company_name}
                </option>
              ))}
            </select>
            <button type="submit" className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white">
              Invite Supplier
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {invited.map((row) => (
              <div key={row.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">{row.supplier_id}</div>
                <div className="mt-2 text-sm text-slate-600">Response: {row.response_status}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Add Supplier Quotation</h2>
          <form onSubmit={onCreateQuote} className="mt-5 space-y-4">
            <select
              value={quoteForm.supplier_id}
              onChange={(e) => setQuoteForm({ ...quoteForm, supplier_id: e.target.value })}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            >
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.company_name}
                </option>
              ))}
            </select>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={quoteForm.quotation_number}
                onChange={(e) => setQuoteForm({ ...quoteForm, quotation_number: e.target.value })}
                placeholder="Quotation number"
                required
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={quoteForm.validity_date}
                onChange={(e) => setQuoteForm({ ...quoteForm, validity_date: e.target.value })}
                placeholder="Validity date"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={quoteForm.total_amount}
                onChange={(e) => setQuoteForm({ ...quoteForm, total_amount: e.target.value })}
                placeholder="Total amount"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={quoteForm.lead_time_days}
                onChange={(e) => setQuoteForm({ ...quoteForm, lead_time_days: e.target.value })}
                placeholder="Lead time days"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">First Quotation Line</div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <input
                  value={quoteForm.unit_price}
                  onChange={(e) => setQuoteForm({ ...quoteForm, unit_price: e.target.value })}
                  placeholder="Unit price"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                />
                <input
                  value={quoteForm.quantity}
                  onChange={(e) => setQuoteForm({ ...quoteForm, quantity: e.target.value })}
                  placeholder="Quantity"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                />
                <input
                  value={quoteForm.tax_amount}
                  onChange={(e) => setQuoteForm({ ...quoteForm, tax_amount: e.target.value })}
                  placeholder="Tax amount"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                />
                <input
                  value={quoteForm.total_line_amount}
                  onChange={(e) => setQuoteForm({ ...quoteForm, total_line_amount: e.target.value })}
                  placeholder="Line total"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                />
              </div>
              <input
                value={quoteForm.brand}
                onChange={(e) => setQuoteForm({ ...quoteForm, brand: e.target.value })}
                placeholder="Brand"
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <textarea
              value={quoteForm.notes}
              onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
              placeholder="Notes"
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />

            <button type="submit" className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white">
              Save Supplier Quotation
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Supplier Quotations</h2>
          <div className="mt-5 space-y-3">
            {quotes.map((quote) => (
              <div key={quote.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-900">{quote.quotation_number}</div>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    {quote.currency}
                  </span>
                </div>
                <div className="mt-2 text-sm text-slate-600">Supplier: {quote.supplier_id}</div>
                <div className="mt-1 text-sm text-slate-600">Total: {quote.total_amount}</div>
                <div className="mt-1 text-sm text-slate-600">Lead time: {quote.lead_time_days ?? "—"}</div>
                <div className="mt-2 text-sm leading-6 text-slate-700">{quote.notes || "No notes."}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Comparison Matrix</h2>
          <form onSubmit={onSaveComparison} className="mt-5 space-y-4">
            <select
              value={comparisonForm.selected_supplier_id}
              onChange={(e) => setComparisonForm({ ...comparisonForm, selected_supplier_id: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            >
              <option value="">Select awarded supplier</option>
              {quotes.map((quote) => (
                <option key={quote.id} value={quote.supplier_id}>
                  {quote.quotation_number} — {quote.supplier_id}
                </option>
              ))}
            </select>
            <input
              value={comparisonForm.approved_by}
              onChange={(e) => setComparisonForm({ ...comparisonForm, approved_by: e.target.value })}
              placeholder="Approved by"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />
            <textarea
              value={comparisonForm.decision_reason}
              onChange={(e) => setComparisonForm({ ...comparisonForm, decision_reason: e.target.value })}
              placeholder="Decision reason"
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />
            <button type="submit" className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white">
              Save Comparison Decision
            </button>
          </form>

          {comparison ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Latest Decision</div>
              <div className="mt-2 text-sm text-slate-600">Selected supplier: {comparison.selected_supplier_id || "—"}</div>
              <div className="mt-2 text-sm leading-6 text-slate-700">{comparison.decision_reason || "No decision reason."}</div>
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Negotiation Log</h2>
          <form onSubmit={onAddNegotiation} className="mt-5 space-y-4">
            <select
              value={negotiationForm.supplier_id}
              onChange={(e) => setNegotiationForm({ ...negotiationForm, supplier_id: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            >
              <option value="">Optional supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.company_name}
                </option>
              ))}
            </select>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={negotiationForm.negotiation_round}
                onChange={(e) => setNegotiationForm({ ...negotiationForm, negotiation_round: e.target.value })}
                placeholder="Round"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={negotiationForm.price_change}
                onChange={(e) => setNegotiationForm({ ...negotiationForm, price_change: e.target.value })}
                placeholder="Price change"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </div>
            <input
              value={negotiationForm.lead_time_change}
              onChange={(e) => setNegotiationForm({ ...negotiationForm, lead_time_change: e.target.value })}
              placeholder="Lead time change"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />
            <textarea
              value={negotiationForm.summary}
              onChange={(e) => setNegotiationForm({ ...negotiationForm, summary: e.target.value })}
              placeholder="Negotiation summary"
              required
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />
            <textarea
              value={negotiationForm.notes}
              onChange={(e) => setNegotiationForm({ ...negotiationForm, notes: e.target.value })}
              placeholder="Notes"
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />
            <button type="submit" className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white">
              Add Negotiation Entry
            </button>
          </form>

          <div className="mt-5 space-y-3">
            {negotiations.map((row) => (
              <div key={row.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Round {row.negotiation_round}</div>
                <div className="mt-2 text-sm leading-6 text-slate-700">{row.summary}</div>
                <div className="mt-2 text-sm text-slate-600">
                  Supplier: {row.supplier_id || "—"} • Price Δ: {row.price_change ?? "—"} • Lead Time Δ: {row.lead_time_change ?? "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
