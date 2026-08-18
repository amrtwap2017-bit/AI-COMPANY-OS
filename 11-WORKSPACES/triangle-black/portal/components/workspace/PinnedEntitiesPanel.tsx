// @ts-nocheck
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listPinnedEntities, togglePinnedEntity, WORKSPACE_MEMORY_EVENT, type WorkspaceEntity } from "../../lib/workspace-memory";

export function PinnedEntitiesPanel() {
  const [items, setItems] = useState<WorkspaceEntity[]>([]);

  useEffect(() => {
    function load() {
      setItems(listPinnedEntities());
    }

    load();
    window.addEventListener(WORKSPACE_MEMORY_EVENT, load);
    return () => window.removeEventListener(WORKSPACE_MEMORY_EVENT, load);
  }, []);

  function unpin(item: WorkspaceEntity) {
    togglePinnedEntity(item);
    setItems(listPinnedEntities());
  }

  return (
    <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          Workspace Favorites
        </div>
        <h2 className="mt-2 text-lg font-semibold text-primary">Pinned Entities</h2>
        <p className="mt-2 text-sm leading-6 text-secondary">
          Keep your most important objects one click away.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-base-alt px-4 py-8 text-sm text-secondary">
          No pinned entities yet. Use the context drawer to pin important records.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((item, index) => (
            <div
              key={item.entityType + item.entityId + item.entityName + index}
              className="rounded-2xl border border-divider bg-base-alt px-4 py-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-primary">{item.entityName || item.entityType}</div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-secondary">{item.entityType}</div>
                  <div className="mt-2 text-sm text-secondary">{item.href}</div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={item.href}
                    className="rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-primary"
                  >
                    Open
                  </Link>
                  <button
                    type="button"
                    onClick={() => unpin(item)}
                    className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
                  >
                    Unpin
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
