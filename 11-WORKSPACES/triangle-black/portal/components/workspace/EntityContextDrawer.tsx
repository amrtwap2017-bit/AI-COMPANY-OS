// @ts-nocheck
"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  isPinnedEntity,
  pushRecentEntity,
  togglePinnedEntity,
  type WorkspaceEntity,
} from "../../lib/workspace-memory";

function entityRouteSuggestions(entity: string, id?: string, name?: string) {
  const base = [
    { label: "Open Workspace Hub", href: "/workspace" },
    { label: "Open Executive Command", href: "/executive/command" },
    { label: "Open Commercial Command", href: "/commercial/command" },
    { label: "Open Operations Command", href: "/operations/command" },
    { label: "Open Supply Chain Command", href: "/supply-chain/command" },
  ];

  const specific: Record<string, { label: string; href: string }[]> = {
    customer: [{ label: "Open Customer 360", href: "/customers/360" }],
    contract: [{ label: "Open Contract 360", href: "/contracts/360" }],
    "work-order": [{ label: "Open Work Order 360", href: "/operations/work-orders/360" }],
    vendor: [{ label: "Open Vendor 360", href: "/supply-chain/vendors/360" }],
    lead: [{ label: "Stay in Commercial Command", href: "/commercial/command" }],
    quote: [{ label: "Stay in Commercial Command", href: "/commercial/command" }],
    technician: [{ label: "Stay in Operations Command", href: "/operations/command" }],
    "service-request": [{ label: "Stay in Operations Command", href: "/operations/command" }],
    "service-report": [{ label: "Stay in Operations Command", href: "/operations/command" }],
    item: [{ label: "Stay in Supply Chain Command", href: "/supply-chain/command" }],
    "purchase-order": [{ label: "Stay in Supply Chain Command", href: "/supply-chain/command" }],
    invoice: [{ label: "Open Customer 360", href: "/customers/360" }],
  };

  const list = [...(specific[entity] || []), ...base];

  return list.map((item) => {
    const params = new URLSearchParams();
    params.set("entity", entity);
    if (id) params.set("id", id);
    if (name) params.set("name", name);
    return {
      label: item.label,
      href: `${item.href}?${params.toString()}`,
    };
  });
}

export function EntityContextDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const entity = searchParams.get("entity");
  const id = searchParams.get("id") || "";
  const name = searchParams.get("name") || "";

  const suggestions = entity ? entityRouteSuggestions(entity, id, name) : [];

  const memoryEntry = useMemo<WorkspaceEntity | null>(() => {
    if (!entity) return null;

    return {
      entityType: entity,
      entityId: id,
      entityName: name || entity,
      href: suggestions[0]?.href || pathname,
      contextPath: pathname,
      notedAt: new Date().toISOString(),
    };
  }, [entity, id, name, pathname, suggestions]);

  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!memoryEntry) return;
    pushRecentEntity(memoryEntry);
    setPinned(isPinnedEntity(memoryEntry));
  }, [memoryEntry]);

  function closeDrawer() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("entity");
    params.delete("id");
    params.delete("name");

    const next = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(next);
  }

  function onTogglePinned() {
    if (!memoryEntry) return;
    const next = togglePinnedEntity(memoryEntry);
    setPinned(next);
  }

  if (!entity) return null;

  return (
    <div className="fixed inset-0 z-[85] pointer-events-auto">
      <div className="absolute inset-0 bg-slate-950/45" onClick={closeDrawer} />

      <div className="absolute right-0 top-0 h-full w-[96vw] max-w-lg overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                Entity Context
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {name || entity}
              </div>
              <div className="mt-2 text-sm text-slate-600">
                Type: {entity} {id ? `• ID: ${id}` : ""}
              </div>
            </div>

            <button
              onClick={closeDrawer}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700"
            >
              Close
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onTogglePinned}
              className={[
                "rounded-full border px-3 py-2 text-xs font-medium",
                pinned
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-slate-200 bg-slate-50 text-slate-700",
              ].join(" ")}
            >
              {pinned ? "Pinned" : "Pin to Workspace"}
            </button>

            <Link
              href="/workspace"
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700"
            >
              Open Workspace Hub
            </Link>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              Why this matters
            </div>
            <div className="mt-3 text-sm leading-7 text-slate-700">
              This drawer lets users move through enterprise relationships without losing context. It now also supports pinning important objects and building a persistent workspace memory.
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="text-lg font-semibold text-slate-950">Suggested Navigation</div>
            <div className="mt-4 space-y-3">
              {suggestions.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className="block rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 transition hover:border-slate-200 hover:bg-white"
                >
                  <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                  <div className="mt-2 text-xs text-secondary">{item.href}</div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="text-lg font-semibold text-slate-950">Context Clues</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                  Current Path
                </div>
                <div className="mt-2 text-sm text-slate-800">{pathname}</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                  Context Payload
                </div>
                <div className="mt-2 text-sm text-slate-800">
                  {entity} {id ? `• ${id}` : ""} {name ? `• ${name}` : ""}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
