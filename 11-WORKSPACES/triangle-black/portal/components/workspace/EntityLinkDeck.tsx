// @ts-nocheck
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type EntityLinkItem = { title: string; detail: string; href: string; badge?: string };
type EntityLinkDeckProps = { title: string; subtitle: string; items: EntityLinkItem[] };

const badgeColors: Record<string, string> = {
  "360": "bg-amber-50 text-amber-700 border-amber-200",
  "Live": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "New": "bg-blue-50 text-blue-700 border-blue-200",
};

export function EntityLinkDeck({ title, subtitle, items }: EntityLinkDeckProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <Link key={item.href + item.title} href={item.href}
            className="group flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-amber-300 hover:bg-white hover:shadow-md">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="text-sm font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">{item.title}</div>
              {item.badge && (
                <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ${badgeColors[item.badge] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                  {item.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed flex-1">{item.detail}</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Open <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
