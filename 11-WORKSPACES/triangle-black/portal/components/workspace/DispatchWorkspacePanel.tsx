type DispatchRecord = { title: string; meta?: string; detail?: string; badges?: string[] };
type DispatchLane = { title: string; subtitle: string; tone?: "neutral" | "success" | "warning"; records: DispatchRecord[] };
type DispatchWorkspacePanelProps = { title: string; subtitle: string; lanes: DispatchLane[] };

const toneMap = {
  success: { lane: "border-emerald-200 bg-emerald-50/60", header: "text-emerald-700", dot: "bg-emerald-500" },
  warning: { lane: "border-amber-200 bg-amber-50/60",     header: "text-amber-700",   dot: "bg-amber-500" },
  neutral: { lane: "border-slate-200 bg-slate-50/60",     header: "text-slate-700",   dot: "bg-slate-400" },
};

export function DispatchWorkspacePanel({ title, subtitle, lanes }: DispatchWorkspacePanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Dispatch Board</div>
        <h2 className="mt-1 text-sm font-bold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {lanes.map((lane, li) => {
          const t = toneMap[lane.tone ?? "neutral"];
          return (
            <div key={`${lane.title}-${li}`} className={`rounded-xl border p-4 ${t.lane}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${t.dot}`} />
                <div>
                  <div className={`text-sm font-bold ${t.header}`}>{lane.title}</div>
                  <div className="text-xs text-slate-500">{lane.subtitle}</div>
                </div>
                <span className="ml-auto text-xs font-bold text-slate-500">{lane.records.length}</span>
              </div>
              <div className="space-y-2">
                {lane.records.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-4 text-xs text-slate-400 text-center">Empty</div>
                ) : lane.records.map((rec, ri) => (
                  <div key={`${rec.title}-${ri}`} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="text-xs font-semibold text-slate-900">{rec.title}</div>
                    {rec.meta && <div className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">{rec.meta}</div>}
                    {rec.detail && <div className="mt-1 text-xs text-slate-500 leading-relaxed">{rec.detail}</div>}
                    {rec.badges && rec.badges.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {rec.badges.map((b, bi) => (
                          <span key={`${b}-${bi}`} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">{b}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
