// @ts-nocheck
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { sourcingApi } from "../../../../../lib/sourcing-api";

export default function ComparisonOverviewPage() {
  const [rfqs, setRfqs] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const data = await sourcingApi.listRfqs();
      if (!active) return;
      setRfqs(Array.isArray(data?.items) ? data.items : []);
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
          Comparison Matrix
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Open an RFQ to compare supplier quotations, record the selected supplier, and store the decision reason.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {rfqs.map((rfq) => (
          <Link
            key={rfq.id}
            href={`/supply-chain/rfqs/${rfq.id}`}
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="text-base font-semibold text-slate-950">{rfq.title}</div>
            <div className="mt-2 text-sm text-slate-500">{rfq.rfq_number}</div>
            <div className="mt-3 text-sm text-slate-700">
              Open this RFQ to review the current comparison and sourcing decision.
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
