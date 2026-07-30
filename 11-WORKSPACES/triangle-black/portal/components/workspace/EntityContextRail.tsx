// @ts-nocheck
type ContextItem = {
  label: string;
  value: string;
  detail: string;
};

type ContextSection = {
  title: string;
  items: ContextItem[];
};

type EntityContextRailProps = {
  title: string;
  subtitle: string;
  sections: ContextSection[];
};

export function EntityContextRail({ title, subtitle, sections }: EntityContextRailProps) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          Context Rail
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="rounded-2xl border border-stone-100 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-stone-900">{section.title}</div>
            <div className="mt-3 space-y-3">
              {section.items.map((item) => (
                <div key={item.label} className="rounded-xl border border-stone-200 bg-white px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-medium text-stone-900">{item.label}</div>
                    <div className="text-sm font-semibold text-slate-950">{item.value}</div>
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
