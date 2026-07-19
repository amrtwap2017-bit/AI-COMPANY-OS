type ExceptionItem = {
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  domain: string;
  owner: string;
  detail: string;
  action: string;
};

type ExceptionDashboardPanelProps = {
  title: string;
  subtitle: string;
  items: ExceptionItem[];
};

function severityClasses(severity: ExceptionItem["severity"]) {
  if (severity === "critical") return "border-rose-300 bg-rose-50";
  if (severity === "high") return "border-amber-300 bg-amber-50";
  if (severity === "medium") return "border-sky-300 bg-sky-50";
  return "border-slate-200 bg-slate-50";
}

export function ExceptionDashboardPanel({ title, subtitle, items }: ExceptionDashboardPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Exception Dashboard
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
            No exceptions are currently visible.
          </div>
        ) : (
          items.map((item, index) => (
            <div key={`${item.title}-${index}`} className={"rounded-2xl border p-4 " + severityClasses(item.severity)}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-semibold text-slate-950">{item.title}</div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    {item.domain}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    {item.severity}
                  </span>
                </div>
              </div>

              <div className="mt-2 text-sm leading-6 text-slate-700">{item.detail}</div>

              <div className="mt-3 grid gap-3 md:grid-cols-[180px_1fr]">
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Owner:</span> {item.owner}
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Next action:</span> {item.action}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
