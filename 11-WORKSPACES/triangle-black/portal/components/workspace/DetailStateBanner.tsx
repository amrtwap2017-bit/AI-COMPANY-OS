// @ts-nocheck
type DetailStateBannerProps = {
  title: string;
  subtitle: string;
  state: string;
  source: string;
};

export function DetailStateBanner({ title, subtitle, state, source }: DetailStateBannerProps) {
  return (
    <section className="rounded-3xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            Entity Focus State
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-950">{title}</div>
          <div className="mt-2 text-sm leading-6 text-secondary">{subtitle}</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-base-alt px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
              State
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-950">{state}</div>
          </div>

          <div className="rounded-2xl border border-border bg-base-alt px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
              Source
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-950">{source}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
