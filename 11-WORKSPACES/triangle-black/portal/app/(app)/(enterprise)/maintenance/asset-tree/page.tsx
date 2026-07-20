// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { maintenanceApi } from "../../../../../lib/maintenance-api";

export default function MaintenanceAssetTreePage() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await maintenanceApi.assetTree();
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
          Asset Tree
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Explore maintenance asset hierarchy across hotel, building, floor, area, room, equipment, and components.
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 text-sm text-slate-600 shadow-sm">
            No asset tree nodes yet.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-base font-semibold text-slate-950">{item.title}</div>
              <div className="mt-2 text-sm text-slate-600">Type: {item.node_type || "—"}</div>
              <div className="mt-1 text-sm text-slate-600">Parent: {item.parent_id || "root"}</div>
              <div className="mt-1 text-sm text-slate-600">Code: {item.asset_code || "—"}</div>
              <div className="mt-2 text-sm leading-6 text-slate-700">{item.notes || "No notes."}</div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
