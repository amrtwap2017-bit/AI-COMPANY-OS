// @ts-nocheck
type GraphNode = {
  label: string;
  value: string;
  detail: string;
};

type ActivityGraphSummaryProps = {
  title: string;
  subtitle: string;
  nodes: GraphNode[];
};

export function ActivityGraphSummary({ title, subtitle, nodes }: ActivityGraphSummaryProps) {
  return (
    <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-secondary">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {nodes.map((node) => (
          <div key={node.label} className="rounded-2xl border border-border bg-base-alt p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
              {node.label}
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {node.value}
            </div>
            <div className="mt-2 text-sm leading-6 text-secondary">{node.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
