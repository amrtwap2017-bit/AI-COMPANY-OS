// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { maintenanceDetailApi } from "../../../../../../lib/maintenance-detail-api";

export default function MaintenanceSchedulesReviewPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const summary = await maintenanceDetailApi.scheduleReview();
        if (!active) return;
        setData(summary);
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
  const queues = data?.queues || {};

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Maintenance Center
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Scheduling Review
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Review maintenance schedules and PM plan timing continuity.
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">{error}</div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Schedules</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{counts.schedules ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">PM Plans</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{counts.plans ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Planned Schedules</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{attention.planned_schedules ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Active Plans</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{attention.active_plans ?? 0}</div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Schedules</h2>
          <div className="mt-4 space-y-3">
            {(queues.schedules || []).map((x: any) => (
              <div key={x.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">{x.title}</div>
                <div className="mt-2 text-sm text-slate-600">{x.schedule_date || "—"} • {x.status || "—"}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Plans</h2>
          <div className="mt-4 space-y-3">
            {(queues.plans || []).map((x: any) => (
              <div key={x.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">{x.title}</div>
                <div className="mt-2 text-sm text-slate-600">{x.next_due_date || "—"} • {x.status || "—"}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
