// @ts-nocheck

"use client";
import { useEffect, useState } from "react";
import { engineeringIntelligenceApi } from "../../../../../lib/engineering-intelligence-api";

export default function EngineeringReviewPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const review = await engineeringIntelligenceApi.review();
        if (!active) return;
        setData(review);
      } catch (e: any) {
        if (!active) return;
        setError(String(e?.message || e));
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const counts = data?.counts || {};
  const attention = data?.attention || {};

  return (
    <div className="space-y-6">
      <Breadcrumb/>
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Engineering Center
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Engineering Review
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Review the current engineering attention layer for inspections, quality, safety, drawings, and technical documents.
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">{error}</div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Inspections</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{counts.inspections ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Open Inspections</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{attention.open_inspections ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Open Quality</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{attention.open_quality ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Open Safety</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{attention.open_safety ?? 0}</div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quality Records</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{counts.quality ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Safety Records</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{counts.safety ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Drawings</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{counts.drawings ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Documents</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{counts.documents ?? 0}</div>
        </div>
      </section>
    </div>
  );
}
