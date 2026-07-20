// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { maintenanceDetailApi } from "../../../../../../lib/maintenance-detail-api";

export default function MaintenanceAsset360Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      if (!id) return;
      try {
        const result = await maintenanceDetailApi.assetContext(id);
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

  const asset = data?.asset || null;

  return (
    <div className="space-y-6">
      <Breadcrumb/>
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Maintenance Center
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          {asset?.title || "Maintenance Asset 360"}
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Maintenance asset detail view for plans, work, warranties, parts, history, downtime, and costs.
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">{error}</div>
      ) : null}

      {!id ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 text-sm text-slate-600 shadow-sm">
          Open this route with a query string like ?id=ASSET_ID
        </div>
      ) : null}

      {asset ? (
        <>
          <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Node Type</div>
              <div className="mt-2 text-lg font-semibold tracking-tight text-slate-950">{asset.node_type || "—"}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Asset Code</div>
              <div className="mt-2 text-lg font-semibold tracking-tight text-slate-950">{asset.asset_code || "—"}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</div>
              <div className="mt-2 text-lg font-semibold tracking-tight text-slate-950">{asset.status || "—"}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Warranty Expiry</div>
              <div className="mt-2 text-lg font-semibold tracking-tight text-slate-950">{asset.warranty_expiry || "—"}</div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">PM Plans</h2>
              <div className="mt-4 space-y-3">
                {(data.pm_plans || []).map((x: any) => (
                  <div key={x.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-900">{x.title}</div>
                    <div className="mt-2 text-sm text-slate-600">{x.frequency || "—"} • {x.status || "—"}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Work Items</h2>
              <div className="mt-4 space-y-3">
                {([...(data.corrective || []), ...(data.emergency || [])]).map((x: any) => (
                  <div key={x.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-900">{x.title}</div>
                    <div className="mt-2 text-sm text-slate-600">{x.work_type || "—"} • {x.status || "—"}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Support Records</h2>
              <div className="mt-4 space-y-3">
                {([...(data.warranties || []), ...(data.parts || [])]).map((x: any) => (
                  <div key={x.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-900">{x.title}</div>
                    <div className="mt-2 text-sm text-slate-600">{x.status || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">History</h2>
              <div className="mt-4 space-y-3">
                {(data.history || []).map((x: any) => (
                  <div key={x.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-900">{x.title}</div>
                    <div className="mt-2 text-sm text-slate-600">{x.event_date || "—"} • {x.result || "—"}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Downtime + Costs</h2>
              <div className="mt-4 space-y-3">
                {([...(data.downtime || []), ...(data.costs || [])]).map((x: any) => (
                  <div key={x.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-900">{x.title}</div>
                    <div className="mt-2 text-sm text-slate-600">
                      {x.downtime_hours ?? x.amount ?? "—"} {x.currency || ""}
                    </div>
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
