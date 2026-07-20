// @ts-nocheck
import Link from "next/link";
import { ArrowRight, Link2 } from "lucide-react";

type GraphNode = { title: string; detail: string; href: string; badge?: string; connections: string[] };
type EnterpriseGraphNavigatorProps = { title: string; subtitle: string; nodes: GraphNode[] };

export function EnterpriseGraphNavigator({ title, subtitle, nodes }: EnterpriseGraphNavigatorProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
          <Link2 className="w-3.5 h-3.5 text-slate-600" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {nodes.map((node) => (
          <Link key={node.href + node.title} href={node.href}
            className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-amber-300 hover:bg-white hover:shadow-md block">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-sm font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">{node.title}</span>
              {node.badge && <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">{node.badge}</span>}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">{node.detail}</p>
            <div className="flex flex-wrap gap-1">
              {node.connections.map((c) => (
                <span key={c} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600">{c}</span>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Navigate <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
