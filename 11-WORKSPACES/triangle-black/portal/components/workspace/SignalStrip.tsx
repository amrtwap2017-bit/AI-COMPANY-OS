
type SignalItem = {
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "success" | "warning";
};

type SignalStripProps = {
  title: string;
  subtitle: string;
  items: SignalItem[];
};

function toneClasses(tone?: SignalItem["tone"]) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50";
  if (tone === "warning") return "border-amber-200 bg-amber-50";
  return "border-slate-200 bg-slate-50";
}

export function SignalStrip({ title, subtitle, items }: SignalStripProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className={"rounded-2xl border p-4 " + toneClasses(item.tone)}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
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
