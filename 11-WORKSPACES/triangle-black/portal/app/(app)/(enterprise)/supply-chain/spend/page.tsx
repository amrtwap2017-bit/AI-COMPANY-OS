"use client";

import { useEffect, useState } from "react";
import { supplyIntelligenceApi } from "../../../../../lib/supply-intelligence-api";

export default function SpendPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const spend = await supplyIntelligenceApi.spend();
        if (!active) return;
        setData(spend);
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
          Spend Analysis
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Review purchasing and supplier invoice totals as the first layer of supply intelligence.
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {data ? (
        <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {key}
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {String(value)}
              </div>
            </div>
          ))}
        </section>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 text-sm text-slate-600 shadow-sm">
          Loading spend intelligence...
        </div>
      )}
    </div>
  );
}
