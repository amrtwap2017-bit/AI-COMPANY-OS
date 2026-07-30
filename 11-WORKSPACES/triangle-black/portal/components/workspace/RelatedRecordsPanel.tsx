// @ts-nocheck
type RelatedRecord = {
  title: string;
  meta?: string;
  detail?: string;
  connections?: string[];
  href?: string;
};

type RelatedGroup = {
  title: string;
  countLabel: string;
  records: RelatedRecord[];
  emptyMessage: string;
};

type RelatedRecordsPanelProps = {
  title: string;
  subtitle: string;
  groups: RelatedGroup[];
};

export function RelatedRecordsPanel({ title, subtitle, groups }: RelatedRecordsPanelProps) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-6 xl:grid-cols-2">
        {groups.map((group) => (
          <div key={group.title} className="rounded-2xl border border-stone-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-950">{group.title}</div>
              <div className="text-xs uppercase tracking-wide text-secondary">{group.countLabel}</div>
            </div>

            {group.records.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-stone-200 bg-white px-4 py-6 text-sm text-secondary">
                {group.emptyMessage}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {group.records.map((record, index) => (
                  <div key={record.title + index} className="rounded-2xl border border-stone-100 bg-white px-4 py-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm font-semibold text-stone-900">{record.title}</div>
                      {record.meta ? (
                        <div className="text-xs uppercase tracking-wide text-secondary">{record.meta}</div>
                      ) : null}
                    </div>

                    {record.detail ? (
                      <div className="mt-2 text-sm leading-6 text-slate-600">{record.detail}</div>
                    ) : null}

                    {record.connections && record.connections.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {record.connections.map((connection) => (
                          <span
                            key={connection}
                            className="rounded-full border border-stone-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                          >
                            {connection}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
