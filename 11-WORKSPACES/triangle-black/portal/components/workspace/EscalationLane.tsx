// @ts-nocheck
type EscalationItem = {
  lane: string;
  owner: string;
  count: string;
  detail: string;
};

type EscalationLaneProps = {
  title: string;
  subtitle: string;
  items: EscalationItem[];
};

export function EscalationLane({ title, subtitle, items }: EscalationLaneProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Escalation Hub
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => (
          <div key={`${item.lane}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-950">{item.lane}</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{item.count}</div>
            <div className="mt-2 text-xs uppercase tracking-wide text-slate-500">{item.owner}</div>
            <div className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
