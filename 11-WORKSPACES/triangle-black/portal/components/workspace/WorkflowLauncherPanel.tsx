// @ts-nocheck
import Link from "next/link";
import { ArrowRight, Workflow } from "lucide-react";

type WorkflowItem = { title: string; detail: string; href: string; stages: string[] };
type WorkflowLauncherPanelProps = { title: string; subtitle: string; workflows: WorkflowItem[] };

export function WorkflowLauncherPanel({ title, subtitle, workflows }: WorkflowLauncherPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
          <Workflow className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Workflow Launcher</div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {workflows.map((wf) => (
          <Link key={wf.title + wf.href} href={wf.href}
            className="group block rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-amber-300 hover:bg-white hover:shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">{wf.title}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-500 transition-colors flex-shrink-0" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">{wf.detail}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {wf.stages.map((stage, i) => (
                <div key={stage} className="flex items-center gap-1.5">
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700">{stage}</span>
                  {i < wf.stages.length - 1 && <span className="text-slate-300 text-xs">→</span>}
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
