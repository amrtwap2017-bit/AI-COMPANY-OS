// @ts-nocheck
type WatchlistItem = {
  title: string;
  severity: string;
  detail: string;
  recommended_action: string;
};

type WatchlistPanelProps = {
  title: string;
  subtitle: string;
  items: WatchlistItem[];
};

function severityClasses(severity: string) {
  if (severity === "success") return "border-emerald-200 bg-emerald-50";
  if (severity === "warning") return "border-amber-200 bg-amber-50";
  return "border-slate-200 bg-slate-50";
}

export function WatchlistPanel({ title, subtitle, items }: WatchlistPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Watchlists
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className={"rounded-2xl border p-4 " + severityClasses(item.severity)}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">{item.title}</div>
              <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                {item.severity}
              </span>
            </div>
            <div className="mt-2 text-sm leading-6 text-slate-700">{item.detail}</div>
            <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Recommended action:</span> {item.recommended_action}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
