// @ts-nocheck
type InsightItem = {
  title: string;
  detail: string;
};

type InsightStackProps = {
  title: string;
  subtitle: string;
  items: InsightItem[];
};

export function InsightStack({ title, subtitle, items }: InsightStackProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">{item.title}</div>
            <div className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
