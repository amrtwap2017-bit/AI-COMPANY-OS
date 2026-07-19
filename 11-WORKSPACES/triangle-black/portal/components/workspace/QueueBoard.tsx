type QueueCard = { title: string; value: string; detail: string };
type QueueColumn = { title: string; subtitle: string; cards: QueueCard[] };
type QueueBoardProps = { title: string; subtitle: string; columns: QueueColumn[] };

export function QueueBoard({ title, subtitle, columns }: QueueBoardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {columns.map((col) => (
          <div key={col.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3">
              <div className="text-sm font-bold text-slate-900">{col.title}</div>
              <div className="text-xs text-slate-500">{col.subtitle}</div>
            </div>
            <div className="space-y-2.5">
              {col.cards.map((card) => (
                <div key={card.title} className="rounded-lg border border-slate-200 bg-white p-3.5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-800">{card.title}</span>
                    <span className="text-lg font-bold text-slate-950 leading-none">{card.value}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{card.detail}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
