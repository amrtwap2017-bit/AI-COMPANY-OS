// @ts-nocheck
type ScorecardItem = {
  title: string;
  score: string;
  status: string;
  detail: string;
  signals: string[];
  tone?: "neutral" | "success" | "warning";
};

type EnterpriseScorecardGridProps = {
  title: string;
  subtitle: string;
  items: ScorecardItem[];
};

function toneClasses(tone?: ScorecardItem["tone"]) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50";
  if (tone === "warning") return "border-amber-200 bg-amber-50";
  return "border-border bg-base-alt";
}

export function EnterpriseScorecardGrid({ title, subtitle, items }: EnterpriseScorecardGridProps) {
  return (
    <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          Enterprise Scorecards
        </div>
        <h2 className="mt-2 text-lg font-semibold text-primary">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-secondary">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className={"rounded-2xl border p-5 " + toneClasses(item.tone)}>
            <div className="flex items-start justify-between gap-3">
              <div className="text-base font-semibold text-primary">{item.title}</div>
              <div className="text-3xl font-semibold tracking-tight text-primary">{item.score}</div>
            </div>

            <div className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              {item.status}
            </div>

            <div className="mt-3 text-sm leading-6 text-primary">
              {item.detail}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {item.signals.map((signal, signalIndex) => (
                <span
                  key={`${signal}-${signalIndex}`}
                  className="rounded-full border border-border bg-white px-3 py-1 text-xs text-primary"
                >
                  {signal}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
