// @ts-nocheck
type RoleWorkspaceBannerProps = {
  role: string;
  title: string;
  description: string;
  actions: string[];
};

export function RoleWorkspaceBanner({ role, title, description, actions }: RoleWorkspaceBannerProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="h-1 w-full bg-gradient-to-r from-slate-900 via-slate-700 to-amber-500" />
      <div className="p-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Role Workspace
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
              {title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              {description}
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            Active Role: {role}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {actions.map((action) => (
            <span
              key={action}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700"
            >
              {action}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
