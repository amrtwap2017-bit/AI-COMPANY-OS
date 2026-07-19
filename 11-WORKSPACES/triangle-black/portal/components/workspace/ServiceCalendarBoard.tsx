type CalendarItem = {
  title: string;
  meta?: string;
  detail?: string;
};

type CalendarBucket = {
  label: string;
  count: string;
  detail: string;
  tone?: "neutral" | "success" | "warning";
  items: CalendarItem[];
};

type ServiceCalendarBoardProps = {
  title: string;
  subtitle: string;
  buckets: CalendarBucket[];
};

function toneClasses(tone?: CalendarBucket["tone"]) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50";
  if (tone === "warning") return "border-amber-200 bg-amber-50";
  return "border-slate-200 bg-slate-50";
}

export function ServiceCalendarBoard({ title, subtitle, buckets }: ServiceCalendarBoardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Operations Calendar
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-4">
        {buckets.map((bucket, index) => (
          <div key={`${bucket.label}-${index}`} className={"rounded-2xl border p-4 " + toneClasses(bucket.tone)}>
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm font-semibold text-slate-950">{bucket.label}</div>
              <div className="text-2xl font-semibold tracking-tight text-slate-950">{bucket.count}</div>
            </div>

            <div className="mt-2 text-sm leading-6 text-slate-700">{bucket.detail}</div>

            <div className="mt-4 space-y-2">
              {bucket.items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-4 text-xs text-slate-500">
                  No records in this bucket
                </div>
              ) : (
                bucket.items.map((item, itemIndex) => (
                  <div key={`${item.title}-${itemIndex}`} className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                    <div className="text-sm font-medium text-slate-900">{item.title}</div>
                    {item.meta ? (
                      <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">{item.meta}</div>
                    ) : null}
                    {item.detail ? (
                      <div className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
