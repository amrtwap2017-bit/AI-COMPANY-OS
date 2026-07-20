// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { suppliersApi } from "../../../../../lib/suppliers-api";
import { supplyIntelligenceApi } from "../../../../../lib/supply-intelligence-api";

export default function AgreementsPage() {
  const [agreements, setAgreements] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    supplier_id: "",
    agreement_number: "",
    category: "",
    start_date: "",
    end_date: "",
    terms_summary: "",
    status: "active",
  });

  async function load() {
    setError("");
    try {
      const [agreementData, supplierData] = await Promise.all([
        supplyIntelligenceApi.listFrameworkAgreements(),
        suppliersApi.list(),
      ]);
      setAgreements(Array.isArray(agreementData) ? agreementData : []);
      setSuppliers(Array.isArray(supplierData?.items) ? supplierData.items : []);
    } catch (e: any) {
      setError(String(e?.message || e));
      setAgreements([]);
      setSuppliers([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await supplyIntelligenceApi.createFrameworkAgreement({
        supplier_id: form.supplier_id,
        agreement_number: form.agreement_number,
        category: form.category || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        terms_summary: form.terms_summary || null,
        status: form.status,
      });

      setForm({
        supplier_id: "",
        agreement_number: "",
        category: "",
        start_date: "",
        end_date: "",
        terms_summary: "",
        status: "active",
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
          Framework Agreements
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Record supplier agreements, category coverage, and terms as the foundation for strategic supply governance.
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Agreement Registry</h2>
          <div className="mt-5 space-y-4">
            {agreements.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-6 text-sm text-slate-600">
                No framework agreements recorded yet.
              </div>
            ) : (
              agreements.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-base font-semibold text-slate-950">
                      {item.agreement_number}
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                      {item.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-600">Supplier: {item.supplier_id}</div>
                  <div className="mt-1 text-sm text-slate-600">Category: {item.category || "—"}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-700">
                    {item.terms_summary || "No terms summary."}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Create Agreement</h2>
          <form onSubmit={onCreate} className="mt-5 space-y-4">
            <select
              value={form.supplier_id}
              onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
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

            <input
              value={form.agreement_number}
              onChange={(e) => setForm({ ...form, agreement_number: e.target.value })}
              placeholder="Agreement number"
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />

            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Category"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                placeholder="Start date"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />

              <input
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                placeholder="End date"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <textarea
              value={form.terms_summary}
              onChange={(e) => setForm({ ...form, terms_summary: e.target.value })}
              placeholder="Terms summary"
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white"
            >
              Create Agreement
            </button>
          </form>
        </section>
      </section>
    </div>
  );
}
