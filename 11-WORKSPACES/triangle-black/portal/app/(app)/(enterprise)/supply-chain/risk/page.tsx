// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { supplyIntelligenceApi } from "../../../../../lib/supply-intelligence-api";

export default function SupplyRiskPage() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const risk = await supplyIntelligenceApi.risk();
        if (!active) return;
        setItems(Array.isArray(risk) ? risk : []);
      } catch (e: any) {
        if (!active) return;
        setError(String(e?.message || e));
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Supply Chain Center
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Supplier Risk
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Review supplier continuity and exposure using current visible purchase and catalog relationships.
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 text-sm text-slate-600 shadow-sm">
            No supplier risk records visible yet.
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="text-base font-semibold text-slate-950">
                  {item.company_name || item.id}
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                  {item.risk_level || "unknown"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                  Orders: {item.purchase_orders_count ?? 0}
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                  Catalogs: {item.catalogs_count ?? 0}
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                  Price Lists: {item.price_lists_count ?? 0}
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
