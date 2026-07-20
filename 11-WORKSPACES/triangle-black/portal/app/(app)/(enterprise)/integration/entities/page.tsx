// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { RoleWorkspaceBanner } from "../../../../../components/workspace/RoleWorkspaceBanner";
import { BackendAlignmentPanel } from "../../../../../components/workspace/BackendAlignmentPanel";
import { entityBackendMatrix } from "../../../../../lib/entity-backend-matrix";
import { entityViewApi } from "../../../../../lib/entity-view-api";

export default function EntityIntegrationWorkspacePage() {
  const [entity, setEntity] = useState("contract");
  const [entityId, setEntityId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const backendDef = useMemo(() => {
    if (entity === "customer") return entityBackendMatrix.customer;
    if (entity === "contract") return entityBackendMatrix.contract;
    if (entity === "work-order") return entityBackendMatrix["work-order"];
    return entityBackendMatrix.vendor;
  }, [entity]);

  async function runLookup() {
    if (!entityId.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      let data;
      if (entity === "customer") {
        data = await entityViewApi.customerContext("contract", entityId.trim());
      } else if (entity === "contract") {
        data = await entityViewApi.contract(entityId.trim());
      } else if (entity === "work-order") {
        data = await entityViewApi.workOrder(entityId.trim());
      } else {
        data = await entityViewApi.vendor(entityId.trim());
      }
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  const statusItems = backendDef.currentFeeds.map((label) => {
    const section = result?.data?.status?.[label.toLowerCase().replace(/ /g, "_")];
    return {
      label,
      ok: !!section?.ok,
      detail: section ? `Count: ${section.count}` : "No live detail payload yet",
    };
  });

  return (
    <div className="space-y-6">
      <RoleWorkspaceBanner
        role="Backend Entity Validation"
        title="Entity integration workspace is active"
        description="Use this page to validate the new backend entity detail endpoints and inspect live payloads before deeper 360 consumption."
        actions={[
          "Validate customer context",
          "Validate contract detail",
          "Validate work order detail",
          "Validate vendor detail",
        ]}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Entity Detail Tester
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[180px_1fr_160px]">
          <select
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
          >
            <option value="customer">customer</option>
            <option value="contract">contract</option>
            <option value="work-order">work-order</option>
            <option value="vendor">vendor</option>
          </select>

          <input
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            placeholder="Enter an entity id"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
          />

          <button
            type="button"
            onClick={runLookup}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white"
          >
            {loading ? "Loading..." : "Load Detail"}
          </button>
        </div>
      </section>

      <BackendAlignmentPanel
        title={backendDef.title}
        subtitle={backendDef.subtitle}
        currentFeeds={statusItems}
        targetEndpoints={backendDef.targetEndpoints}
        relatedObjects={backendDef.relatedObjects}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Live Payload
        </div>
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-800">
{JSON.stringify(result, null, 2)}
        </pre>
      </section>
    </div>
  );
}
