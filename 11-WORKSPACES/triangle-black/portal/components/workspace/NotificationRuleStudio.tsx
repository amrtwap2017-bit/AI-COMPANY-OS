// @ts-nocheck
type NotificationRuleRow = {
  event: string;
  owner: string;
  destination: string;
  severity: string;
  detail: string;
  status: "Active" | "Draft" | "Review";
};

type NotificationRuleStudioProps = {
  title: string;
  subtitle: string;
  rows: NotificationRuleRow[];
};

function statusClasses(status: NotificationRuleRow["status"]) {
  if (status === "Active") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "Review") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function NotificationRuleStudio({ title, subtitle, rows }: NotificationRuleStudioProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Notification Rules Studio
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[980px] rounded-2xl border border-slate-200">
          <div className="grid grid-cols-[1.2fr_0.9fr_1fr_0.7fr_1.6fr_0.8fr] gap-0 border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <div className="px-4 py-3">Event</div>
            <div className="px-4 py-3">Owner</div>
            <div className="px-4 py-3">Destination</div>
            <div className="px-4 py-3">Severity</div>
            <div className="px-4 py-3">Rule Logic</div>
            <div className="px-4 py-3">Status</div>
          </div>

          {rows.map((row, index) => (
            <div
              key={`${row.event}-${row.owner}-${index}`}
              className="grid grid-cols-[1.2fr_0.9fr_1fr_0.7fr_1.6fr_0.8fr] gap-0 border-b border-slate-100 last:border-b-0"
            >
              <div className="px-4 py-4 text-sm font-semibold text-slate-900">{row.event}</div>
              <div className="px-4 py-4 text-sm text-slate-700">{row.owner}</div>
              <div className="px-4 py-4 text-sm text-slate-700">{row.destination}</div>
              <div className="px-4 py-4 text-sm text-slate-700">{row.severity}</div>
              <div className="px-4 py-4 text-sm leading-6 text-slate-600">{row.detail}</div>
              <div className="px-4 py-4">
                <span className={"rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide " + statusClasses(row.status)}>
                  {row.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
