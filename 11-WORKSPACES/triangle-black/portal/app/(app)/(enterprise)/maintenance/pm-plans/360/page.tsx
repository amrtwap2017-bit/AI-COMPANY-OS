// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { maintenanceDetailApi } from "../../../../../../lib/maintenance-detail-api";

export default function MaintenancePlan360Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      if (!id) return;
      try {
        const result = await maintenanceDetailApi.planContext(id);
        if (!active) return;
        setData(result);
      } catch (e: any) {
        if (!active) return;
        setError(String(e?.message || e));
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  const plan = data?.plan || null;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Maintenance Center
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          {plan?.title || "PM Plan 360"}
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          PM plan detail view for schedules and related work records.
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">{error}</div>
      ) : null}

      {!id ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 text-sm text-slate-600 shadow-sm">
          Open this route with a query string like ?id=PLAN_ID
        </div>
      ) : null}

      {plan ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Plan Type</div>
              <div className="mt-2 text-lg font-semibold tracking-tight text-slate-950">{plan.plan_type || "—"}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Frequency</div>
              <div className="mt-2 text-lg font-semibold tracking-tight text-slate-950">{plan.frequency || "—"}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Next Due</div>
              <div className="mt-2 text-lg font-semibold tracking-tight text-slate-950">{plan.next_due_date || "—"}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</div>
              <div className="mt-2 text-lg font-semibold tracking-tight text-slate-950">{plan.status || "—"}</div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Schedules</h2>
              <div className="mt-4 space-y-3">
                {(data.schedules || []).map((x: any) => (
                  <div key={x.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-900">{x.title}</div>
                    <div className="mt-2 text-sm text-slate-600">{x.schedule_date || "—"} • {x.status || "—"}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Related Work Items</h2>
              <div className="mt-4 space-y-3">
                {(data.work_items || []).map((x: any) => (
                  <div key={x.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-900">{x.title}</div>
                    <div className="mt-2 text-sm text-slate-600">{x.work_type || "—"} • {x.status || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
