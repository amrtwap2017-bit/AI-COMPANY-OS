
type JourneyStep = {
  label: string;
  detail: string;
  tone?: "neutral" | "success" | "warning";
};

type ObjectJourneyRibbonProps = {
  title: string;
  subtitle: string;
  steps: JourneyStep[];
};

function toneClasses(tone?: JourneyStep["tone"]) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-slate-200 bg-slate-50 text-slate-900";
}

export function ObjectJourneyRibbon({ title, subtitle, steps }: ObjectJourneyRibbonProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-6">
        {steps.map((step, index) => (
          <div key={step.label} className="relative">
            <div className={"h-full rounded-2xl border p-4 " + toneClasses(step.tone)}>
              <div className="text-sm font-semibold">{step.label}</div>
              <div className="mt-2 text-sm leading-6 text-slate-600">{step.detail}</div>
            </div>

            {index < steps.length - 1 ? (
              <div className="hidden lg:block absolute -right-2 top-1/2 z-10 h-0.5 w-4 -translate-y-1/2 bg-slate-300" />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
