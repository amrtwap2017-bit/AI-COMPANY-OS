// @ts-nocheck
import Link from "next/link";

type ActionItem = {
  title: string;
  detail: string;
  href: string;
  group: string;
  tone?: "neutral" | "success" | "warning";
};

type CrossObjectActionCenterProps = {
  title: string;
  subtitle: string;
  actions: ActionItem[];
};

function toneClasses(tone?: ActionItem["tone"]) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50";
  if (tone === "warning") return "border-amber-200 bg-amber-50";
  return "border-slate-200 bg-slate-50";
}

export function CrossObjectActionCenter({ title, subtitle, actions }: CrossObjectActionCenterProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Action Center
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.title + action.href}
            href={action.href}
            className={"block rounded-2xl border p-4 transition hover:border-slate-300 hover:bg-white " + toneClasses(action.tone)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm font-semibold text-slate-950">{action.title}</div>
              <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                {action.group}
              </span>
            </div>
            <div className="mt-3 text-sm leading-6 text-slate-600">{action.detail}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
