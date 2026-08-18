// @ts-nocheck
type TimelineEvent = {
  time: string;
  title: string;
  detail: string;
  tone?: "neutral" | "success" | "warning";
};

type RelationshipTimelineProps = {
  title: string;
  subtitle: string;
  events: TimelineEvent[];
};

function dotClasses(tone?: TimelineEvent["tone"]) {
  if (tone === "success") return "bg-emerald-500";
  if (tone === "warning") return "bg-amber-500";
  return "bg-base-alt";
}

export function RelationshipTimeline({ title, subtitle, events }: RelationshipTimelineProps) {
  return (
    <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-secondary">{subtitle}</p>
      </div>

      <div className="mt-5 space-y-4">
        {events.map((event) => (
          <div key={event.time + event.title} className="flex gap-4">
            <div className={"mt-2 h-3 w-3 rounded-full " + dotClasses(event.tone)} />
            <div className="min-w-0 flex-1 rounded-2xl border border-divider bg-base-alt p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-semibold text-primary">{event.title}</div>
                <div className="text-xs uppercase tracking-wide text-secondary">{event.time}</div>
              </div>
              <div className="mt-2 text-sm leading-6 text-secondary">{event.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
