// @ts-nocheck
type ObjectNode = {
  title: string;
  value: string;
  detail: string;
  connections: string[];
  tone?: "neutral" | "success" | "warning";
};

type ObjectLinkMapProps = {
  title: string;
  subtitle: string;
  nodes: ObjectNode[];
};

function toneClasses(tone?: ObjectNode["tone"]) {
  if (tone === "success") return "border-emerald-200";
  if (tone === "warning") return "border-amber-200";
  return "border-slate-200";
}

export function ObjectLinkMap({ title, subtitle, nodes }: ObjectLinkMapProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {nodes.map((node) => (
          <div key={node.title} className={"rounded-2xl border bg-slate-50 p-5 " + toneClasses(node.tone)}>
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">{node.title}</div>
              <div className="text-2xl font-semibold tracking-tight text-slate-950">{node.value}</div>
            </div>

            <div className="mt-3 text-sm leading-6 text-slate-600">{node.detail}</div>

            <div className="mt-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Connected To
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {node.connections.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
