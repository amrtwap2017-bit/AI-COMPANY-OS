// @ts-nocheck
type SavedView = {
  name: string;
  detail: string;
  status?: "Default" | "Team" | "Personal";
};

type SavedViewsPanelProps = {
  title: string;
  subtitle: string;
  views: SavedView[];
};

function badgeClasses(status?: SavedView["status"]) {
  if (status === "Default") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "Team") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function SavedViewsPanel({ title, subtitle, views }: SavedViewsPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 space-y-3">
        {views.map((view) => (
          <button
            key={view.name}
            type="button"
            className="block w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-200 hover:bg-white"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">{view.name}</div>
              {view.status ? (
                <span className={"rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide " + badgeClasses(view.status)}>
                  {view.status}
                </span>
              ) : null}
            </div>
            <div className="mt-2 text-sm leading-6 text-slate-600">{view.detail}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
