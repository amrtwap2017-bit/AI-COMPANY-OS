// @ts-nocheck
type TrendPoint = {
  month: string;
  count: number;
};

type TrendSeries = {
  label: string;
  points: TrendPoint[];
};

type TrendSeriesPanelProps = {
  title: string;
  subtitle: string;
  series: TrendSeries[];
};

function maxOf(points: TrendPoint[]) {
  const max = Math.max(0, ...points.map((p: any) => p.count || 0));
  return max || 1;
}

export function TrendSeriesPanel({ title, subtitle, series }: TrendSeriesPanelProps) {
  return (
    <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          Trend Layer
        </div>
        <h2 className="mt-2 text-lg font-semibold text-primary">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-secondary">{subtitle}</p>
      </div>

      <div className="mt-6 space-y-6">
        {series.map((s: any, idx: any) => {
          const max = maxOf(s.points);
          return (
            <div key={`${s.label}-${idx}`} className="rounded-2xl border border-divider bg-base-alt p-4">
              <div className="text-sm font-semibold text-primary">{s.label}</div>

              {s.points.length === 0 ? (
                <div className="mt-3 text-sm text-secondary">No trend points available.</div>
              ) : (
                <div className="mt-4 space-y-3">
                  {s.points.map((point: any, pointIdx: any) => (
                    <div key={`${point.month}-${pointIdx}`}>
                      <div className="mb-1 flex items-center justify-between text-xs text-secondary">
                        <span>{point.month}</span>
                        <span>{point.count}</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-surface-alt">
                        <div
                          className="h-full rounded-full bg-sidebar"
                          style={{ width: `${Math.max(6, Math.round((point.count / max) * 100))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
