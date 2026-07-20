// @ts-nocheck
import Link from "next/link";
import { EntityPill } from "./EntityPill";

type RecordItem = {
  title: string;
  meta?: string;
  detail?: string;
  href?: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  connections?: string[];
};

type RecordListCardProps = {
  title: string;
  subtitle: string;
  items: RecordItem[];
  emptyMessage: string;
};

export function RecordListCard({ title, subtitle, items, emptyMessage }: RecordListCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((item, index) => (
            <div key={item.title + index} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    {item.href ? (
                      <Link href={item.href} className="text-sm font-semibold text-slate-900 underline-offset-4 hover:underline">
                        {item.title}
                      </Link>
                    ) : (
                      <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                    )}
                  </div>

                  {item.meta ? (
                    <div className="text-xs uppercase tracking-wide text-slate-500">{item.meta}</div>
                  ) : null}
                </div>

                {item.detail ? (
                  <div className="text-sm leading-6 text-slate-600">{item.detail}</div>
                ) : null}

                {item.connections && item.connections.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {item.connections.map((connection) => (
                      <span
                        key={connection}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                      >
                        {connection}
                      </span>
                    ))}
                  </div>
                ) : null}

                {(item.entityType || item.href) ? (
                  <div className="flex flex-wrap gap-2">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Open Workspace
                      </Link>
                    ) : null}

                    {item.entityType ? (
                      <EntityPill
                        basePath={item.href || ""}
                        entityType={item.entityType}
                        entityId={item.entityId}
                        entityName={item.entityName || item.title}
                        label="Open Context"
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
