
type LinkedScenario = {
  title: string;
  detail: string;
  chain: string[];
};

type LinkedScenarioPanelProps = {
  title: string;
  subtitle: string;
  scenarios: LinkedScenario[];
};

export function LinkedScenarioPanel({ title, subtitle, scenarios }: LinkedScenarioPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 space-y-4">
        {scenarios.map((scenario) => (
          <div key={scenario.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">{scenario.title}</div>
            <div className="mt-2 text-sm leading-6 text-slate-600">{scenario.detail}</div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {scenario.chain.map((item, index) => (
                <div key={item + index} className="flex items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">
                    {item}
                  </span>
                  {index < scenario.chain.length - 1 ? (
                    <span className="text-slate-400">→</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
