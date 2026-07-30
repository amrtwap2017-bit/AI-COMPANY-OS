// @ts-nocheck
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listRecentEntities, WORKSPACE_MEMORY_EVENT, type WorkspaceEntity } from "../../lib/workspace-memory";

export function RecentEntitiesPanel() {
  const [items, setItems] = useState<WorkspaceEntity[]>([]);

  useEffect(() => {
    function load() {
      setItems(listRecentEntities());
    }

    load();
    window.addEventListener(WORKSPACE_MEMORY_EVENT, load);
    return () => window.removeEventListener(WORKSPACE_MEMORY_EVENT, load);
  }, []);

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          Workspace Memory
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">Recent Entities</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Continue where you left off across customers, contracts, work orders, and vendors.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-stone-200 bg-slate-50 px-4 py-8 text-sm text-secondary">
          No recent entities yet. Open entity context drawers to build your workspace memory.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((item, index) => (
            <Link
              key={item.entityType + item.entityId + item.entityName + index}
              href={item.href}
              className="block rounded-2xl border border-stone-100 bg-slate-50 px-4 py-4 transition hover:border-stone-200 hover:bg-white"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-semibold text-stone-900">{item.entityName || item.entityType}</div>
                <div className="text-xs uppercase tracking-wide text-secondary">{item.entityType}</div>
              </div>
              <div className="mt-2 text-sm text-slate-600">Target: {item.href}</div>
              <div className="mt-1 text-xs text-secondary">Context: {item.contextPath || "—"}</div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
