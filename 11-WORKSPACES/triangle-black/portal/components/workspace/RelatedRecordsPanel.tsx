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
    <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-secondary">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-6 xl:grid-cols-2">
        {groups.map((group: any) => (
          <div key={group.title} className="rounded-2xl border border-border bg-base-alt p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-primary">{group.title}</div>
              <div className="text-xs uppercase tracking-wide text-secondary">{group.countLabel}</div>
            </div>

            {group.records.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-border bg-white px-4 py-6 text-sm text-secondary">
                {group.emptyMessage}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {group.records.map((record: any, index: any) => (
                  <div key={record.title + index} className="rounded-2xl border border-divider bg-white px-4 py-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm font-semibold text-primary">{record.title}</div>
                      {record.meta ? (
                        <div className="text-xs uppercase tracking-wide text-secondary">{record.meta}</div>
                      ) : null}
                    </div>

                    {record.detail ? (
                      <div className="mt-2 text-sm leading-6 text-secondary">{record.detail}</div>
                    ) : null}

                    {record.connections && record.connections.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {record.connections.map((connection: any) => (
                          <span
                            key={connection}
                            className="rounded-full border border-border bg-base-alt px-3 py-1 text-xs text-primary"
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
