"use client";

import { useEffect, useState } from "react";
import { maintenanceApi } from "../../../../../../lib/maintenance-api";

export default function MaintenanceCostReviewPage() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await maintenanceApi.list("costs");
        if (!active) return;
        setItems(Array.isArray(data?.items) ? data.items : []);
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
          Maintenance Center
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Cost Review
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Review maintenance cost records and cost type distribution.
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">{error}</div>
      ) : null}

      <section className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 text-sm text-slate-600 shadow-sm">
            No maintenance cost records yet.
          </div>
        ) : (
          items.map((x) => (
            <div key={x.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-base font-semibold text-slate-950">{x.title}</div>
              <div className="mt-2 text-sm text-slate-600">
                Cost Type: {x.cost_type || "—"} • Amount: {x.amount ?? "—"} {x.currency || ""}
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-700">{x.notes || "No notes."}</div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
