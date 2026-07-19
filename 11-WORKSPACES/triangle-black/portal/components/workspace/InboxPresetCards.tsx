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
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Inbox Presets
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {presets.map((preset, index) => (
          <div key={`${preset.title}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="text-base font-semibold text-slate-950">{preset.title}</div>
              <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                {preset.audience}
              </span>
            </div>

            <div className="mt-3 text-sm leading-6 text-slate-700">{preset.detail}</div>

            <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Default View
            </div>
            <div className="mt-2 text-sm text-slate-800">{preset.defaultView}</div>

            <div className="mt-4 flex flex-wrap gap-2">
              {preset.filters.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
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
