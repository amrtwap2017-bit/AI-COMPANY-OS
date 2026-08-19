// @ts-nocheck
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type CenterModuleItem = { title: string; description: string; href?: string; status?: "Live" | "Legacy" | "Planned" };
type CenterModuleGridProps = { title: string; subtitle: string; items: CenterModuleItem[] };

const statusMap: Record<string, string> = {
  Live:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Legacy:  "bg-amber-50 text-amber-700 border-amber-200",
  Planned: "bg-surface-alt text-secondary border-border",
};

export function CenterModuleGrid({ title, subtitle, items }: CenterModuleGridProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="border-b border-divider px-5 py-4">
        <h2 className="text-sm font-bold text-primary">{title}</h2>
        <p className="mt-0.5 text-xs text-secondary">{subtitle}</p>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item: any) => {
          const inner = (
            <div className="group h-full rounded-xl border border-border bg-base-alt p-4 transition-all hover:border-amber-300 hover:bg-white hover:shadow-md">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="text-sm font-semibold text-primary group-hover:text-amber-700 transition-colors">{item.title}</div>
                {item.status && (
                  <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ${statusMap[item.status]}`}>{item.status}</span>
                )}
              </div>
              <p className="text-xs text-secondary leading-relaxed">{item.description}</p>
              {item.href && (
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          );
          return item.href
            ? <Link key={item.title} href={item.href}>{inner}</Link>
            : <div key={item.title}>{inner}</div>;
        })}
      </div>
    </section>
  );
}
