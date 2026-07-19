type IntegrationStatusItem = {
  label: string;
  ok: boolean;
  detail: string;
};

type IntegrationStatusPanelProps = {
  title: string;
  subtitle: string;
  items: IntegrationStatusItem[];
};

export function IntegrationStatusPanel({ title, subtitle, items }: IntegrationStatusPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">{item.label}</div>
              <div className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</div>
            </div>

            <span
              className={[
                "inline-flex shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
                item.ok
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700",
              ].join(" ")}
            >
              {item.ok ? "Connected" : "Attention"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
