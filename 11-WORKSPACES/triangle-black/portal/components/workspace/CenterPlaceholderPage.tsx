// @ts-nocheck
import { Clock, ArrowRight } from "lucide-react";

type PlaceholderAction = { label: string; detail: string };
type CenterPlaceholderPageProps = {
  eyebrow: string; title: string; subtitle: string;
  bullets: string[]; actions: PlaceholderAction[];
};

export function CenterPlaceholderPage({ eyebrow, title, subtitle, bullets, actions }: CenterPlaceholderPageProps) {
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-0.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-tertiary">{eyebrow}</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              <Clock className="w-2.5 h-2.5" /> Coming Soon
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{subtitle}</p>
        </div>
      </section>
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Workspace Scope</h2>
          <ul className="space-y-2">
            {bullets.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                <span className="text-sm text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Build Priorities</h2>
          <div className="space-y-2">
            {actions.map((item, i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                </div>
                <p className="mt-1 ml-7 text-xs text-secondary leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
