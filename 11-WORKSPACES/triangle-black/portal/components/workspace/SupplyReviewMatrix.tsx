// @ts-nocheck
type SupplyReviewItem = {
  title: string;
  value: string;
  detail: string;
  emphasis?: "neutral" | "success" | "warning";
};

type SupplyReviewMatrixProps = {
  title: string;
  subtitle: string;
  items: SupplyReviewItem[];
};

function emphasisClasses(emphasis?: SupplyReviewItem["emphasis"]) {
  if (emphasis === "success") return "border-emerald-200 bg-emerald-50";
  if (emphasis === "warning") return "border-amber-200 bg-amber-50";
  return "border-border bg-base-alt";
}

export function SupplyReviewMatrix({ title, subtitle, items }: SupplyReviewMatrixProps) {
  return (
    <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          Supply Review
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-secondary">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className={"rounded-2xl border p-4 " + emphasisClasses(item.emphasis)}>
            <div className="text-sm font-semibold text-primary">{item.title}</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{item.value}</div>
            <div className="mt-2 text-sm leading-6 text-secondary">{item.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
