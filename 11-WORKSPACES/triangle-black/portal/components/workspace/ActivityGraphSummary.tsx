
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
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {nodes.map((node) => (
          <div key={node.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {node.label}
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {node.value}
            </div>
            <div className="mt-2 text-sm leading-6 text-slate-600">{node.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
