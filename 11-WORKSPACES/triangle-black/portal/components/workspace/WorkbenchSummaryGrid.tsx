// @ts-nocheck
type SummaryItem = {
  label: string;
  value: string;
  detail: string;
};

type WorkbenchSummaryGridProps = {
  title: string;
  subtitle: string;
  items: SummaryItem[];
};

export function WorkbenchSummaryGrid({ title, subtitle, items }: WorkbenchSummaryGridProps) {
  return (
    <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-secondary">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item: any) => (
          <div key={item.label} className="rounded-2xl border border-border bg-base-alt p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
              {item.label}
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-primary">
              {item.value}
            </div>
            <div className="mt-2 text-sm leading-6 text-secondary">
              {item.detail}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
