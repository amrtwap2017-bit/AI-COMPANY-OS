// @ts-nocheck
type RelationshipCard = {
  title: string;
  value: string;
  detail: string;
  links: string[];
};

type RelationshipGridProps = {
  title: string;
  subtitle: string;
  items: RelationshipCard[];
};

export function RelationshipGrid({ title, subtitle, items }: RelationshipGridProps) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-2xl border border-stone-200 bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm font-semibold text-stone-900">{item.title}</div>
              <div className="text-2xl font-semibold tracking-tight text-slate-950">{item.value}</div>
            </div>

            <div className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</div>

            <div className="mt-4 flex flex-wrap gap-2">
              {item.links.map((link) => (
                <span
                  key={link}
                  className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-slate-700"
                >
                  {link}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
