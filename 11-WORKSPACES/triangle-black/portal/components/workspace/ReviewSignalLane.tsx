// @ts-nocheck
type ReviewSignalItem = {
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "success" | "warning";
};

type ReviewSignalColumn = {
  title: string;
  subtitle: string;
  items: ReviewSignalItem[];
};

type ReviewSignalLaneProps = {
  title: string;
  subtitle: string;
  columns: ReviewSignalColumn[];
};

function toneClasses(tone?: ReviewSignalItem["tone"]) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50";
  if (tone === "warning") return "border-amber-200 bg-amber-50";
  return "border-border bg-base-alt";
}

export function ReviewSignalLane({ title, subtitle, columns }: ReviewSignalLaneProps) {
  return (
    <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          Review Intelligence
        </div>
        <h2 className="mt-2 text-lg font-semibold text-primary">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-secondary">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-4">
        {columns.map((column: any, index: any) => (
          <div key={`${column.title}-${index}`} className="rounded-2xl border border-border bg-base-alt p-4">
            <div className="text-base font-semibold text-primary">{column.title}</div>
            <div className="mt-1 text-sm text-secondary">{column.subtitle}</div>

            <div className="mt-4 space-y-3">
              {column.items.map((item: any, itemIndex: any) => (
                <div key={`${item.label}-${itemIndex}`} className={"rounded-xl border p-3 " + toneClasses(item.tone)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-medium text-primary">{item.label}</div>
                    <div className="text-xl font-semibold tracking-tight text-primary">{item.value}</div>
                  </div>
                  <div className="mt-2 text-sm leading-6 text-secondary">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
