// @ts-nocheck
type InboxPreset = {
  title: string;
  audience: string;
  detail: string;
  filters: string[];
  defaultView: string;
};

type InboxPresetCardsProps = {
  title: string;
  subtitle: string;
  presets: InboxPreset[];
};

export function InboxPresetCards({ title, subtitle, presets }: InboxPresetCardsProps) {
  return (
    <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          Inbox Presets
        </div>
        <h2 className="mt-2 text-lg font-semibold text-primary">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-secondary">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {presets.map((preset, index) => (
          <div key={`${preset.title}-${index}`} className="rounded-2xl border border-border bg-base-alt p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="text-base font-semibold text-primary">{preset.title}</div>
              <span className="rounded-full border border-border bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {preset.audience}
              </span>
            </div>

            <div className="mt-3 text-sm leading-6 text-primary">{preset.detail}</div>

            <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              Default View
            </div>
            <div className="mt-2 text-sm text-primary">{preset.defaultView}</div>

            <div className="mt-4 flex flex-wrap gap-2">
              {preset.filters.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border bg-white px-3 py-1 text-xs text-primary"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
