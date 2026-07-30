// @ts-nocheck
type EntitySummaryItem = {
  label: string;
  value: string;
  detail: string;
};

type EntitySummaryCardsProps = {
  title: string;
  subtitle: string;
  items: EntitySummaryItem[];
};

export function EntitySummaryCards({ title, subtitle, items }: EntitySummaryCardsProps) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          Entity Summary
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className="rounded-2xl border border-stone-200 bg-slate-50 p-4"
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
              {item.label}
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {item.value}
            </div>
            <div className="mt-2 text-sm leading-6 text-slate-600">
              {item.detail}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
