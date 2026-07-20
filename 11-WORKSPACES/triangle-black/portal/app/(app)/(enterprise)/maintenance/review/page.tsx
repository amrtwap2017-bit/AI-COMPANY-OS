// @ts-nocheck

"use client";
import { useEffect, useState } from "react";
import { maintenanceActionsApi } from "../../../../../lib/maintenance-actions-api";

export default function MaintenanceReviewPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const review = await maintenanceActionsApi.reviewSummary();
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
          Maintenance Center
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Maintenance Review
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Review the current maintenance attention layer for PM, corrective, emergency, downtime, and costs.
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">{error}</div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Assets</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{counts.assets ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">PM Plans</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{counts.pm_plans ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Corrective</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{counts.corrective ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Emergency</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{counts.emergency ?? 0}</div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Active Assets</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{attention.active_assets ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">PM Due</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{attention.pm_due_signal ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Corrective Open</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{attention.corrective_open ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Emergency Open</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{attention.emergency_open ?? 0}</div>
        </div>
      </section>
    </div>
  );
}
