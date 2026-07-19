type QueueCard = {
  title: string;
  meta?: string;
  detail?: string;
  badges?: string[];
};

type QueueColumn = {
  title: string;
  subtitle: string;
  tone?: "neutral" | "success" | "warning";
  cards: QueueCard[];
};

type QueueBoardMatrixProps = {
  title: string;
  subtitle: string;
  columns: QueueColumn[];
};

function toneClasses(tone?: QueueColumn["tone"]) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50";
  if (tone === "warning") return "border-amber-200 bg-amber-50";
  return "border-slate-200 bg-slate-50";
}

export function QueueBoardMatrix({ title, subtitle, columns }: QueueBoardMatrixProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Queue Board
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-4">
        {columns.map((column, index) => (
          <div key={`${column.title}-${index}`} className={"rounded-2xl border p-4 " + toneClasses(column.tone)}>
            <div className="text-base font-semibold text-slate-950">{column.title}</div>
            <div className="mt-1 text-sm text-slate-600">{column.subtitle}</div>

            <div className="mt-4 space-y-3">
              {column.cards.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-4 text-xs text-slate-500">
                  No records in this queue
                </div>
              ) : (
                column.cards.map((card, cardIndex) => (
                  <div key={`${card.title}-${cardIndex}`} className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                    <div className="text-sm font-medium text-slate-900">{card.title}</div>
                    {card.meta ? (
                      <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">{card.meta}</div>
                    ) : null}
                    {card.detail ? (
                      <div className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</div>
                    ) : null}
                    {card.badges && card.badges.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {card.badges.map((badge, badgeIndex) => (
                          <span
                            key={`${badge}-${badgeIndex}`}
                            className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
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
