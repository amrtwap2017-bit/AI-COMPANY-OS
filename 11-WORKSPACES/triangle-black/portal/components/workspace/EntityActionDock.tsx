// @ts-nocheck
import Link from "next/link";

type DockAction = {
  title: string;
  detail: string;
  href: string;
  tone?: "neutral" | "success" | "warning";
};

type EntityActionDockProps = {
  title: string;
  subtitle: string;
  actions: DockAction[];
};

function toneClasses(tone?: DockAction["tone"]) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50";
  if (tone === "warning") return "border-amber-200 bg-amber-50";
  return "border-border bg-base-alt";
}

export function EntityActionDock({ title, subtitle, actions }: EntityActionDockProps) {
  return (
    <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          Action Dock
        </div>
        <h2 className="mt-2 text-lg font-semibold text-primary">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-secondary">{subtitle}</p>
      </div>

      <div className="mt-5 space-y-3">
        {actions.map((action: any) => (
          <Link
            key={action.href + action.title}
            href={action.href}
            className={"block rounded-2xl border p-4 transition hover:border-border hover:bg-white " + toneClasses(action.tone)}
          >
            <div className="text-sm font-semibold text-primary">{action.title}</div>
            <div className="mt-2 text-sm leading-6 text-secondary">{action.detail}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
